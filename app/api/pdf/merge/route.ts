import { NextResponse } from "next/server";
import * as PDFLib from "pdf-lib";

const MAX_TOTAL_SIZE = 4.5 * 1024 * 1024; // 4.5MB
const MAX_FILES = 10;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    // Validate file count
    if (files.length < 2 || files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Please provide between 2 and ${MAX_FILES} PDF files` },
        { status: 400 }
      );
    }

    // Validate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: "Total file size exceeds 4.5MB limit" },
        { status: 400 }
      );
    }

    // Validate file types
    for (const file of files) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "All files must be PDFs" },
          { status: 400 }
        );
      }
    }

    // Merge PDFs
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of files) {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();

    return new NextResponse(mergedPdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"'
      }
    });
  } catch (error: any) {
    console.error("PDF Merge Error:", error);
    return NextResponse.json(
      { error: "Failed to merge PDFs" },
      { status: 500 }
    );
  }
}