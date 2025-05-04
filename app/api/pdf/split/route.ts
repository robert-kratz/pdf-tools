import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Parses a string of page selections into an array of page-index arrays.
 * Supported formats: "1", "2-4", "1,3-5,7", "1,1-2", "1,1,1,1" etc.
 * Returns e.g. [[1], [1,2], [1], [1], [1], [1]] for "1,1-2,1,1,1,1".
 */
function parsePageSelections(input: string): number[][] {
  const regex = /(\d+)(?:-(\d+))?/g;
  const selections: number[][] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const a = parseInt(match[1], 10);
    const b = match[2] ? parseInt(match[2], 10) : a;
    const from = Math.min(a, b);
    const to = Math.max(a, b);

    const pages: number[] = [];
    for (let p = from; p <= to; p++) {
      pages.push(p);
    }
    selections.push(pages);
  }

  return selections;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileField = formData.get("file");
    const rangesField = formData.get("ranges");
    const rangesInput = typeof rangesField === "string" ? rangesField.trim() : "";

    // 1) Validate file
    if (!(fileField instanceof Blob) || fileField.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Please upload a valid PDF file." },
        { status: 400 }
      );
    }
    if (fileField.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10 MB limit." },
        { status: 400 }
      );
    }

    // 2) Parse pages
    const selections = parsePageSelections(rangesInput);
    if (selections.length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid page selections. Use formats like '1', '2-4', '1,3-5', or '1,1-2'."
        },
        { status: 400 }
      );
    }

    // 3) Load PDF and get total pages
    const arrayBuffer = await fileField.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    // 4) Build ZIP
    const zip = new JSZip();
    const nameCounts: Record<string, number> = {};

    await Promise.all(
      selections.map(async (pages) => {
        // clamp to [1..totalPages]
        const valid = pages.filter((p) => p >= 1 && p <= totalPages);
        if (valid.length === 0) return;

        // build base name
        const baseName =
          valid.length === 1
            ? `page_${valid[0]}`
            : `pages_${valid[0]}-${valid[valid.length - 1]}`;

        // increment count for this baseName
        nameCounts[baseName] = (nameCounts[baseName] || 0) + 1;
        const count = nameCounts[baseName];

        // append suffix only if duplicate
        const filename =
          count === 1 ? `${baseName}.pdf` : `${baseName}_${count}.pdf`;

        const newPdf = await PDFDocument.create();
        const copied = await newPdf.copyPages(
          pdfDoc,
          valid.map((p) => p - 1)
        );
        copied.forEach((pg) => newPdf.addPage(pg));

        const pdfBytes = await newPdf.save();
        zip.file(filename, pdfBytes);
      })
    );

    // 5) Generate ZIP and respond
    const zipBuffer = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
    });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="split_pdfs.zip"',
      },
    });
  } catch (err) {
    console.error("Error splitting PDF:", err);
    return NextResponse.json(
      { error: "Failed to split PDF. Please try again." },
      { status: 500 }
    );
  }
}