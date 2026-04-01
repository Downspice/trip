'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus,
  ShieldCheck,
  Settings,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'TRIIP';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fefdfb] selection:bg-primary/30 font-sans">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md ">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-[2rem] font-black leading-none tracking-tighter text-transparent ">
            TRIIP
          </div>
          <nav className="hidden md:flex items-center gap-8">

            <Link href="/bookings" className="text-sm font-semibold text-[#6b6a7a] hover:text-primary transition-colors">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border-2 border-[#4a4856] bg-transparent px-7 py-2 font-semibold text-[#3a3947] transition-all duration-300 hover:bg-[#4a4856] hover:text-[#fefdfb]"
              >
                Confirm your seat 
              </motion.button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <section className="relative z-10 flex min-h-screen items-center justify-center px-[5%] py-20">
          <div className="mx-auto w-full max-w-[1400px] text-center">
            {/* Large TRIIP Logo with Typing Effect */}
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-8 bg-gradient-to-br from-primary to-secondary bg-clip-text text-[12rem] font-black leading-none tracking-tighter text-transparent md:text-[8rem] sm:text-[5rem]"
            >
              {displayText}
              <AnimatePresence>
                {showCursor && (
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                      times: [0, 0.5, 1],
                    }}
                    exit={{ opacity: 0 }}
                  >
                    |
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.h1>

            {/* Hero Text */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            >
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mb-6 text-5xl font-extrabold leading-tight text-[#3a3947] md:text-3xl sm:text-2xl tracking-tight"
              >
                The Ultimate School Trip Booking Solution
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mx-auto mb-12 max-w-[800px] text-xl leading-relaxed text-[#6b6a7a] md:text-lg sm:text-base sm:px-4"
              >
                Everything you need to manage student registrations, parent visitations, <br className="hidden md:block" />
                and secure school logistics in one powerful platform.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-6 sm:flex-col sm:px-4"
              >
                <Link href="/booking" className="block w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full rounded-[20px] bg-primary px-12 py-5 text-xl font-extrabold text-primary-foreground transition-all duration-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)] sm:px-8 sm:py-4 flex items-center justify-center gap-2"
                  >
                    Book Student Seat<ArrowRight className="w-6 h-6" />
                  </motion.button>
                </Link>
                <Link href="/visit" className="block w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full rounded-[20px] border-2 border-[#4a4856] bg-transparent px-12 py-5 text-xl font-bold text-[#3a3947] transition-all duration-300 hover:bg-[#3a3947] hover:text-[#fefdfb] sm:px-8 sm:py-4 flex items-center justify-center gap-2"
                  >
                    Book Parent Visit
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
