# PDF Tools

## Description

PDF Tools is a web application designed to provide simple, client-side PDF manipulation functionalities. Currently, it supports splitting and merging PDF files directly within the browser, ensuring user privacy and data security. No server-side processing is involved.

## Features

1. **Split PDF**

    * **Functionality:** Extracts specific pages or ranges of pages from a PDF file and creates separate PDF files for each specified range.
    * **User Input:** Accepts a PDF file and a comma-separated string defining the page ranges to split. Examples: `"1"`, `"2-4"`, `"1,3-5"`.
    * **Output:** Generates a ZIP archive containing the split PDF files, named according to their page ranges (e.g., `page_1.pdf`, `pages_2-4.pdf`).
    * **Implementation:**

        * Utilizes the `pdf-lib` library for PDF manipulation.
        * Employs the `jszip` library to create a ZIP archive for download.
        * The splitting logic is handled in the `/app/api/pdf/split/route.ts` API route.
        * The `parsePageSelections` function parses the page range input.
    * **Accessibility:** Accessible via the **Split** card on the homepage or the `/split` route.

2. **Merge PDFs**

    * **Functionality:** Combines multiple PDF files into a single PDF document.
    * **User Input:** Accepts two or more PDF files selected from the file list.
    * **Output:** Generates a single merged PDF file, which is then offered for download.
    * **Implementation:**

        * Uses the `pdf-lib` library to merge the PDF files.
        * The merging logic is handled in the `/app/api/pdf/merge/route.ts` API route.
    * **Accessibility:** Accessible via the **Merge** card on the homepage or the `/merge` route.

3. **Upload PDFs**

    * **Functionality:** Allows users to upload PDF files into the application for processing.
    * **Implementation:**

        * Uses the `react-dropzone` library for drag-and-drop functionality.
        * Validates that uploaded files are PDFs and do not exceed the maximum file size (50 MB).
        * Uploaded files are stored in the Zustand store.
    * **Accessibility:** An upload zone is available on the homepage and within the file list on the Split and Merge pages.

4. **Download Center**

    * **Functionality:** Provides a list of processed files available for download.
    * **Implementation:**

        * Uses a Zustand store to manage the list of downloadable files.
        * Displays file name, size, and a download link for each file.
        * Allows users to remove individual downloads or clear the entire list.
    * **Accessibility:** Accessible via the **Downloads** button in the header.

## Technologies Used

* **Next.js**: React framework for building the application.
* **React**: JavaScript library for building user interfaces.
* **TypeScript**: Superset of JavaScript that adds static typing.
* **Tailwind CSS**: Utility-first CSS framework for styling.
* **shadcn/ui**: Reusable components built using Radix UI and Tailwind CSS.
* **lucide-react**: Collection of icons.
* **pdf-lib**: JavaScript library for PDF manipulation.
* **jszip**: JavaScript library for creating, reading, and editing ZIP files.
* **zustand**: State management library.
* **framer-motion**: Animation library.
* **react-dropzone**: Library for drag‑and‑drop file uploads.

## Project Structure

```
app/
├─ api/
│  ├─ pdf/
│  │  ├─ split/route.ts     # API route for splitting PDFs
│  │  └─ merge/route.ts     # API route for merging PDFs
│  └─ ...
├─ split/page.tsx           # Component for the split PDF functionality
├─ merge/page.tsx           # Component for the merge PDF functionality
├─ page.tsx                 # Home page component with upload and feature sections
├─ layout.tsx               # Root layout component
components/
├─ DownloadCenter.tsx       # Component for managing and displaying downloads
├─ FileList.tsx             # Component for displaying a list of uploaded files
├─ UploadZone.tsx           # Component for handling file uploads
├─ Header.tsx               # Component for the site header
├─ Footer.tsx               # Component for the site footer
├─ PrivacyBanner.tsx        # Component for displaying the privacy banner
hooks/
├─ use-pdf-processor.ts     # Hook for handling PDF processing logic (split, merge)
├─ use-pdf-thumbnail.ts     # Hook for generating PDF thumbnails
lib/
├─ store.ts                 # Zustand store for managing application state
├─ types.ts                 # TypeScript type definitions
├─ utils.ts                 # Utility functions
public/
├─ pdf.worker.js            # PDF.js worker
└─ ...
```

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Run the development server:

   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## API Endpoints

* `POST /api/pdf/split` — Splits a PDF file based on the provided page ranges.
* `POST /api/pdf/merge` — Merges multiple PDF files into a single PDF file.

## State Management

The application uses Zustand for state management (in `lib/store.ts`). It manages the following state:

* `files`: An array of `FileEntry` objects representing the uploaded PDF files.
* `selectedForMerge`: An array of file IDs that are selected for merging.
* `currentOperation`: The current operation being performed (`'split'` or `'merge'`).
* `downloads`: An array of `DownloadEntry` objects representing the processed files available for download.

## Client-Side Processing

All PDF processing is performed on the client-side using JavaScript libraries (`pdf-lib`, `jszip`). This ensures that no data is uploaded to a server, enhancing user privacy and data security.

## Notes

* The application is designed to be fully functional without a backend server.
* The maximum file size for uploaded PDFs is 50 MB.
* The application uses local storage to persist the list of downloads across sessions.
* The "Protect PDF" functionality has been removed from the UI.

## Author

* [Robert Julian Kratz](https://github.com/robert-kratz) - Developer and maintainer of the PDF Tools application.