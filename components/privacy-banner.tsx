"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="sticky top-0 z-50 bg-indigo-600 text-white px-4 py-3"
      >
        <div className="container flex items-center justify-between">
          <p className="text-sm font-medium">
            No data is being saved.
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 text-white hover:text-indigo-100 transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}