import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};

export function HeroSection() {
  return (
    <section className="relative w-full h-[100vh] min-h-[750px] max-h-[950px] flex flex-col justify-center hero-figma-gradient overflow-hidden px-8 lg:px-16 pt-24 pb-12">
      
      {/* Decorative Assets positioned absolutely across the section */}
      {/* Top Left Document (doc4 - Grey card) */}
      <DecorativeElement 
        src="/assets/hero/doc4.svg" 
        className="absolute top-[15%] left-[2%] w-20 md:w-28 z-0 opacity-60"
        delay="0s"
        msg="Your Contracts Deserve More Than a PDF"
      />
      {/* Top Center Document (doc5 - Hand and pen) */}
      <DecorativeElement 
        src="/assets/hero/doc5.svg" 
        className="absolute top-[15%] left-[42%] w-28 md:w-36 z-0 opacity-60"
        delay="1s"
        msg="Legally Binding Anywhere"
      />
      {/* Bottom Left Document (doc1 - Contract red pen) */}
      <DecorativeElement 
        src="/assets/hero/doc1.svg" 
        className="absolute bottom-[5%] left-[5%] w-32 md:w-40 z-0 opacity-60"
        delay="2s"
        msg="Sign It. Seal It. Ship It."
      />
      {/* Bottom Center Left Document (doc2 - Hand pointing) */}
      <DecorativeElement 
        src="/assets/hero/doc2.svg" 
        className="absolute bottom-[2%] left-[24%] w-28 md:w-36 z-0 opacity-60"
        delay="3s"
        msg="Every Deal Deserves a Signature Worth Trusting"
      />
      {/* Bottom Center Right Document (doc3 - Person standing) */}
      <DecorativeElement 
        src="/assets/hero/doc3.svg" 
        className="absolute bottom-[5%] left-[43%] w-24 md:w-32 z-0 opacity-60"
        delay="4s"
        msg="Built for Freelancers. Trusted by Clients."
      />

      <div className="max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 pointer-events-none">
        
        {/* Left Content (45-50%) */}
        <div className="w-full lg:w-[52%] flex flex-col items-start relative z-10 translate-y-[100px] pointer-events-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col">
            <h1 className="font-lancelot text-[60px] md:text-[90px] lg:text-[100px] leading-[1.1] text-black m-0">
              Every Deal
            </h1>
            <div className="flex items-center flex-nowrap gap-4 mt-4 whitespace-nowrap">
              <span className="font-lancelot text-[50px] md:text-[80px] lg:text-[90px] leading-[1.1] text-black">
                Deserves a
              </span>
              <span className="font-fleur text-[70px] md:text-[100px] lg:text-[120px] leading-[0.8] text-[#106EBE]">
                Signature
              </span>
            </div>
            <p className="font-itim text-[28px] lg:text-[30px] mt-1 text-[#ff80e5] font-medium tracking-wide">
              Worth Trusting
            </p>
          </motion.div>
        </div>

        {/* Right Content / Main Illustration (55-60%) */}
        <div className="w-full lg:w-[55%] flex items-center justify-end relative z-15 pointer-events-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full flex justify-end">
            <div className="float-figma w-full flex justify-end">
              <img 
                src="/assets/hero/Leftside-hero-section.png" 
                alt="Main Contract Illustration" 
                className="w-[95%] lg:w-[100%] max-w-[852px] h-auto object-contain translate-x-15 lg:translate-x-15 translate-y-[140px]" 
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row: Status Labels and Signature */}
      <div className="max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row items-end justify-between relative z-25 mt-16 pointer-events-none">
        
        {/* Status Labels */}
        <div className="flex flex-wrap items-center gap-10 lg:gap-37 font-jaldi text-[15px] lg:text-[15px] text-black font-semibold pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ff6be3] shadow-[0_0_10px_rgba(255,107,227,0.6)]" />
            <span>IT Act 2000 compliant</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ff6be3] shadow-[0_0_10px_rgba(255,107,227,0.6)]" />
            <span>ESIGN / eIDAS ready</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ff6be3] shadow-[0_0_10px_rgba(255,107,227,0.6)]" />
            <span className="text-[#106EBE]">Instant PDF Delivery</span>
          </div>
        </div>

        {/* Bottom Right Signature */}
        <div className="flex flex-col items-center mt-9 lg:mt-15 lg:mr-1 pointer-events-auto">
          <img src="/assets/hero/Corner-Signature.png" alt="Signature" className="h-[80px] md:h-[90px] object-contain" />
          <span className="font-lancelot text-[38px] lg:text-[25px] text-[#063be8] mt-[-35px]">
            Sign Once. Seal the Deal.
          </span>
        </div>
      </div>

    </section>
  );
}

function DecorativeElement({ src, className, delay, msg }: { src: string, className: string, delay: string, msg: string }) {
  return (
    <div className={`float-figma group cursor-pointer ${className}`} style={{ animationDelay: delay }}>
      <img src={src} alt="Decorative" className="w-full h-full object-contain drop-shadow-lg" />
      
      {/* ASUS-style Dark Glassmorphism Hover Card */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 ease-out z-50 min-w-[280px]">
        <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-inner" />
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold tracking-wide">E-Sign</span>
              <span className="text-white/50 text-[11px] font-medium tracking-wider uppercase">System Notification</span>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium leading-relaxed">"{msg}"</p>
        </div>
      </div>
    </div>
  );
}
