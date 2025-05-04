"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText,
  Scissors, 
  MergeIcon
} from "lucide-react";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import DownloadCenter from "@/components/download-center";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    name: "Split",
    href: "/split",
    icon: Scissors,
  },
  {
    name: "Merge",
    href: "/merge",
    icon: MergeIcon,
  }
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="p-1.5 rounded-md bg-primary/10 text-primary"
            >
              <FileText className="h-5 w-5" />
            </motion.div>
            <span className="font-semibold text-lg tracking-tight hidden md:inline">PDF Tools</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "relative px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    isActive 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center">
                    <item.icon className={cn(
                      "h-4 w-4 mr-1.5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "p-2",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <DownloadCenter />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}