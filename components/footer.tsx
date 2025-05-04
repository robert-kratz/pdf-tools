import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="container">
        <div className="footer-content">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <Link
                href="https://www.rjks.us/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="https://www.rjks.us/legal-notice"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Legal Notice
              </Link>
              <Link
                href="https://www.rjks.us/privacy-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <a
                href="https://github.com/robert-kratz/pdf-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PDF Tools. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}