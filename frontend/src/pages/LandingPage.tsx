import { useRef } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  FileSignature, Lock, Globe, Zap, Camera, Mail, Shield, FileText,
  ArrowRight, CheckCircle2, Sparkles, Clock, Users, Star
} from "lucide-react";
import { motion, useInView } from "framer-motion";

/* ── Animation variants ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as any } },
};

/* ── Feature data ────────────────────────────────────────────────────────── */
const features = [
  { icon: FileSignature, title: "Secure Digital Signing", desc: "Legally binding electronic signatures with a full, tamper-proof audit trail.", color: "blue", iconBg: "bg-[#106EBE]/10", iconColor: "text-[#106EBE]" },
  { icon: FileText,      title: "PDF & DOCX Upload",     desc: "Upload any contract file — PDF or DOCX — up to 20 MB in seconds.",        color: "mint", iconBg: "bg-[#0FFCBF]/10", iconColor: "text-[#0dcca0]" },
  { icon: Globe,         title: "Geo / IP Tracking",     desc: "Records signer location, IP address, and device info automatically.",      color: "blue", iconBg: "bg-[#106EBE]/10", iconColor: "text-[#106EBE]" },
  { icon: Camera,        title: "Camera Verification",   desc: "Signer takes a selfie before signing — embedded directly in the PDF.",     color: "mint", iconBg: "bg-[#0FFCBF]/10", iconColor: "text-[#0dcca0]" },
  { icon: Zap,           title: "Instant PDF Generation",desc: "Signed PDF with signature, selfie, and audit trail in milliseconds.",      color: "blue", iconBg: "bg-[#106EBE]/10", iconColor: "text-[#106EBE]" },
  { icon: Mail,          title: "Email Delivery",         desc: "Both parties receive the signed PDF by email automatically.",              color: "mint", iconBg: "bg-[#0FFCBF]/10", iconColor: "text-[#0dcca0]" },
  { icon: Shield,        title: "Legal Audit Trail",      desc: "Every step logged: IP, timestamp, location, device, and signature.",       color: "blue", iconBg: "bg-[#106EBE]/10", iconColor: "text-[#106EBE]" },
  { icon: Lock,          title: "Expiring Secure Links",  desc: "Signing links expire automatically. Tamper-proof UUID tokens.",            color: "mint", iconBg: "bg-[#0FFCBF]/10", iconColor: "text-[#0dcca0]" },
];

/* ── How It Works data ───────────────────────────────────────────────────── */
const steps = [
  { n: "01", title: "Upload Your Contract",      desc: "Upload a PDF or DOCX file and fill in the signer's details.",                                icon: FileText },
  { n: "02", title: "Generate Signing Link",     desc: "A secure unique link is created and automatically emailed to your client.",                   icon: Mail },
  { n: "03", title: "Client Verifies & Signs",   desc: "Client takes a selfie, confirms details, and draws their signature in three guided steps.",    icon: Camera },
  { n: "04", title: "PDF Generated Instantly",   desc: "A professional signed PDF is compiled with the full legal audit trail attached.",              icon: Zap },
  { n: "05", title: "Both Parties Get a Copy",   desc: "Signed PDF is emailed to both you and the client — ready to reference any time.",             icon: CheckCircle2 },
];

/* ── Stats bar data ──────────────────────────────────────────────────────── */
const stats = [
  { value: "100%", label: "Legally Binding", icon: Shield },
  { value: "< 60s", label: "Sign & Deliver", icon: Clock },
  { value: "5-Step", label: "Verified Process", icon: CheckCircle2 },
  { value: "Global", label: "Client Support", icon: Globe },
];

/* ── Animated section heading ────────────────────────────────────────────── */
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#106EBE] bg-[#106EBE]/8 border border-[#106EBE]/20 rounded-full px-3 py-1 mb-4">
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function LandingPage() {
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const statsRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ══ Hero ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-28 lg:pt-48 lg:pb-40 px-6 gradient-hero text-white overflow-hidden">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute top-1/4 left-1/5 w-[600px] h-[600px] bg-[#106EBE]/12 rounded-full blur-3xl" />
          <div className="animate-float absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-[#0FFCBF]/7 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-2 h-2 bg-[#0FFCBF] rounded-full animate-pulse" />
          <div className="absolute top-32 left-20 w-1 h-1 bg-[#106EBE]/60 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-[#0FFCBF]/60 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <motion.div
          initial="hidden" animate="visible"
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 bg-white/6 border border-white/10 rounded-full px-5 py-2 text-xs font-medium text-slate-300 mb-10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0FFCBF] animate-pulse" />
              Secure · Legally Trackable · International
              <span className="ml-1 px-2 py-0.5 bg-[#0FFCBF]/15 text-[#0FFCBF] rounded-full text-[10px] font-bold tracking-wide">NEW</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} custom={1}
            className="font-display text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 leading-[1.05]"
          >
            Professional Freelance
            <br />
            <span className="gradient-text-animated">Contracts & E-Signatures</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fadeUp} custom={2}
            className="text-lg lg:text-xl text-slate-300/90 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Send contracts, collect legally-trackable signatures, and generate
            professional signed PDFs — all in under a minute.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard/contracts/new">
              <Button
                size="lg"
                className="group w-full sm:w-auto bg-[#106EBE] hover:bg-[#0d5fa3] text-white font-semibold text-base px-8 h-14 rounded-xl glow-blue transition-all duration-300 hover:glow-blue-lg"
              >
                Upload Contract
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/15 text-white hover:bg-white/8 hover:border-[#0FFCBF]/40 font-medium text-base px-8 h-14 rounded-xl glass transition-all duration-300"
              >
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div variants={fadeUp} custom={4}
            className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs text-slate-400"
          >
            {["IT Act 2000 compliant", "ESIGN / eIDAS ready", "UUID token security", "Instant PDF delivery"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0FFCBF]" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══ Stats bar ════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="border-b border-t border-[#106EBE]/10 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#106EBE]/10">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="flex flex-col items-center justify-center py-8 px-6 gap-2 group hover:bg-[#106EBE]/3 transition-colors"
              >
                <Icon className="w-5 h-5 text-[#106EBE]/50 group-hover:text-[#106EBE] transition-colors mb-1" />
                <span className="font-mono text-2xl font-bold text-[#0A1628] tracking-tight">{s.value}</span>
                <span className="text-xs text-slate-500 font-medium">{s.label}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ Features ══════════════════════════════════════════════════════ */}
      <section id="features" ref={featuresRef} className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <SectionTag>Platform Features</SectionTag>
              <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-5 text-[#0A1628]">
                Everything to close deals
                <span className="block gradient-text">professionally</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
                Built for freelancers and consultants working with national and international clients.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              const cardClass = f.color === "blue" ? "feature-card-blue" : "feature-card-mint";
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className={`feature-card ${cardClass} p-6 rounded-2xl bg-white border border-slate-100 group cursor-default`}
                >
                  <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-heading font-semibold text-[#0A1628] text-base mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ How It Works ══════════════════════════════════════════════════ */}
      <section id="how-it-works" ref={stepsRef} className="py-28 px-6" style={{ background: "linear-gradient(180deg, #f0f7ff 0%, #e8f5f0 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <SectionTag>How It Works</SectionTag>
              <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-5 text-[#0A1628]">
                From upload to signed PDF
                <span className="block gradient-text">in minutes</span>
              </h2>
              <p className="text-slate-500 text-base">A seamless experience for you and your clients, every time.</p>
            </motion.div>
          </div>

          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-[#106EBE] via-[#0FFCBF] to-transparent rounded-full" />

            <div className="space-y-5">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.n}
                    variants={fadeLeft}
                    custom={i}
                    initial="hidden"
                    animate={stepsInView ? "visible" : "hidden"}
                    className="relative flex items-start gap-6 group"
                  >
                    {/* Step badge */}
                    <div className="relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm font-bold shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: "linear-gradient(135deg,#106EBE,#0FFCBF)", color: "#0A1628" }}
                    >
                      {s.n}
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white/80 backdrop-blur border border-white shadow-sm rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:bg-white group-hover:border-[#106EBE]/20">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-heading font-semibold text-[#0A1628] text-base mb-1">{s.title}</p>
                          <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                        </div>
                        <div className="shrink-0 w-9 h-9 bg-[#106EBE]/8 rounded-lg flex items-center justify-center group-hover:bg-[#106EBE]/15 transition-colors">
                          <Icon className="w-4 h-4 text-[#106EBE]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Social proof strip ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-t border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#0FFCBF] text-[#0FFCBF]" />
              ))}
            </div>
            <blockquote className="font-display text-xl lg:text-2xl font-semibold text-[#0A1628] max-w-2xl mx-auto mb-4 leading-relaxed">
              "Finally a signing tool built for freelancers. Clean, fast, and my clients trust the process."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#106EBE] to-[#0FFCBF] flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Independent Consultant, Mumbai</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 gradient-hero text-white text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-float-slow absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#106EBE]/15 rounded-full blur-3xl" />
          <div className="animate-float absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#0FFCBF]/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <SectionTag>Get Started Today</SectionTag>
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            Ready to send your<br />
            <span className="gradient-text-animated">first contract?</span>
          </h2>
          <p className="text-slate-300/90 mb-10 text-lg leading-relaxed">
            Upload your contract, generate a secure signing link, and get it
            signed — all in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/contracts/new">
              <Button
                size="lg"
                className="group font-semibold px-10 h-14 text-base rounded-xl animate-pulse-glow-mint transition-all duration-300 hover:scale-105"
                style={{ background: "#0FFCBF", color: "#0A1628" }}
              >
                Upload Contract
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline"
                className="font-semibold px-10 h-14 text-base rounded-xl border-white/15 text-white hover:bg-white/8 glass"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══ Footer ════════════════════════════════════════════════════════ */}
      <footer className="gradient-dark border-t border-white/6 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#106EBE] flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Saathi Sign</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Saathi Sign. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-slate-300 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
