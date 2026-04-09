'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus,
  ShieldCheck,
  Settings,
  ArrowRight,
  GraduationCap,
  Users,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const features = [
    {
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      title: "Student Registration",
      description: "Seamless digital boarding for every student. Fast, easy, and paperless."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Parent Portals",
      description: "Keep parents informed with real-time updates and secure visit booking."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "Enhanced Safety",
      description: "Advanced tracking and safety protocols to ensure every student is accounted for."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Bus className="text-primary-foreground w-6 h-6" />
            </div>
            <div className="text-2xl font-black tracking-tighter text-foreground">
              TRIIP
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/bookings" className="group">
              <Button variant="outline" className="rounded-full px-6 border-secondary/20 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
                Manage Bookings
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Background Image Container */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative h-full w-full"
            >
              <Image 
                src="/hero-bg.png" 
                alt="School Trip Journey" 
                fill 
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-3xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold rounded-full border-primary/20 bg-primary/10 text-primary">
                  The Future of School Logistics
                </Badge>
              </motion.div>

              <motion.h1 
                className="text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6 text-foreground"
              >
                <span className="block">{displayText}</span>
                <AnimatePresence>
                  {showCursor && (
                    <motion.span
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      exit={{ opacity: 0 }}
                      className="text-primary"
                    >
                      |
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.span 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="block text-secondary mt-2"
                >
                  Unforgettable <br /> Journeys.
                </motion.span>
              </motion.h1>

              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
              >
                Simplify school trip planning with our all-in-one platform. 
                From student seat bookings to parent visitations, we've got you covered.
              </motion.p>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/booking">
                  <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 bg-primary hover:bg-primary/90">
                    Student Booking <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/visit">
                  <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-2 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
                    Book Parent Visit
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Why Schools Choose TRIIP</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built specifically for modern educational institutions to handle the complex logistics of school outings.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-background/50 backdrop-blur-sm group">
                    <CardContent className="p-8">
                      <div className="mb-6 p-3 w-fit rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* trust section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 bg-secondary rounded-[3rem] p-12 md:p-20 text-secondary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
              
              <div className="flex-1 relative z-10">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                  Ready to upgrade your school's journey?
                </h2>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="text-lg">Real-time attendance tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="text-lg">Secure credit card payments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="text-lg">Automated parent notifications</span>
                  </div>
                </div>
                <Link href="/booking">
                  <Button size="lg" className="rounded-2xl h-14 px-8 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started Now
                  </Button>
                </Link>
              </div>

              <div className="flex-1 w-full relative h-[400px]">
                <div className="absolute inset-0 border-4 border-primary/30 rounded-3xl transform rotate-3" />
                <div className="absolute inset-0 bg-background rounded-3xl overflow-hidden transform -rotate-2 shadow-2xl">
                   <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="h-6 w-32 bg-muted rounded-full" />
                        <div className="h-10 w-10 bg-primary/20 rounded-full" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-12 w-full bg-muted/50 rounded-xl" />
                        <div className="h-12 w-full bg-muted/50 rounded-xl" />
                        <div className="h-12 w-3/4 bg-muted/50 rounded-xl" />
                        <div className="h-24 w-full bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                           <span className="font-bold text-primary">Live Booking Active</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bus className="text-primary-foreground w-4 h-4" />
            </div>
            <div className="text-xl font-black tracking-tighter">
              TRIIP
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 School Trip Logistics. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-semibold text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
