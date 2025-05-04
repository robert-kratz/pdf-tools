"use client";

import { GlobalWorkerOptions } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist/build/pdf"; 

// Direkt Pfad zum lokal gehosteten ESM-Worker setzen
GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export default {
  getPdfJs: async () => {
    // pdfjsLib ist bereits geladen als Modul
    return pdfjsLib;
  },
};