"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { TransitionSection } from "@/components/sections/TransitionSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  const scrollToTop = () => {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-green-200 selection:text-green-900">
      <Navbar onScrollToTop={scrollToTop} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SecuritySection />
        <TransitionSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
