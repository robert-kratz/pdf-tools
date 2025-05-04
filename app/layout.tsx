import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import PrivacyBanner from "@/components/privacy-banner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDF Tools - Split, Merge, and Protect PDFs',
  description: 'Easy-to-use online tools for PDF management. Split, merge, and protect your PDF files with confidence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            
            <Header />
            <main className="main-content">
              <div className="container">
                {children}
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}