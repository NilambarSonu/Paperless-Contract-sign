import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { FileSignature, Lock, Globe, Zap, Camera, Mail, Shield, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: FileSignature, title: "Secure Digital Signing", desc: "Legally binding electronic signatures with full audit trail." },
  { icon: FileText, title: "PDF & DOCX Upload", desc: "Upload any contract file — PDF or DOCX — up to 20 MB." },
  { icon: Globe, title: "Geo/IP Tracking", desc: "Records signer location, IP address, and device info automatically." },
  { icon: Camera, title: "Camera Verification", desc: "Signer must take a selfie before signing — embedded in the PDF." },
  { icon: Zap, title: "Instant PDF Generation", desc: "Signed PDF with signature, selfie, and audit trail generated immediately." },
  { icon: Mail, title: "Email Delivery", desc: "Both parties receive the signed PDF by email automatically." },
  { icon: Shield, title: "Legal Audit Trail", desc: "Every step logged: IP, timestamp, location, device, and signature." },
  { icon: Lock, title: "Expiring Secure Links", desc: "Signing links expire automatically. Tamper-proof with UUID tokens." },
];

const steps = [
  { n: "01", title: "Upload Your Contract", desc: "Upload a PDF or DOCX file and enter the signer's details." },
  { n: "02", title: "Generate Signing Link", desc: "A secure unique link is created and automatically emailed to the signer." },
  { n: "03", title: "Client Verifies & Signs", desc: "Client takes a selfie, confirms details, and draws their signature." },
  { n: "04", title: "PDF Generated Instantly", desc: "A professional signed PDF is compiled with the full audit trail." },
  { n: "05", title: "Both Parties Receive Copy", desc: "Signed PDF is emailed to both you and the client immediately." },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const } }),
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 lg:pt-48 lg:pb-36 px-6 gradient-hero text-white overflow-hidden relative">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-xs text-slate-300 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Secure · Legally Trackable · International
          </div>

          <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
            Professional Freelance<br />
            Contracts &amp; <span className="gradient-text">E-Signatures</span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Securely send contracts, collect signatures, and receive legally trackable documents worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/contracts/new">
              <Button
                data-testid="button-upload-contract"
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-8 glow-blue h-14"
              >
                Upload Contract &rarr;
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                data-testid="button-go-dashboard"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-medium text-lg px-8 h-14 glass"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Everything you need to close deals professionally
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built for freelancers and consultants working with national and international clients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={cardVariants}
              className="p-6 rounded-2xl bg-card border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-muted/30 border-t border-b">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">A seamless experience for you and your clients — from upload to signed PDF in minutes.</p>
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-start gap-5 bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#106EBE,#0FFCBF)", color: "#0A1628" }}
                >
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-base">{s.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5 ml-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 gradient-hero text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-4xl font-bold mb-4">Ready to send your first contract?</h2>
          <p className="text-slate-300 mb-10 max-w-xl mx-auto text-lg">
            Upload your contract and generate a secure signing link in seconds.
          </p>
          <Link href="/dashboard/contracts/new">
            <Button
              data-testid="button-cta"
              size="lg"
              className="font-semibold px-10 h-14 text-lg glow-mint"
              style={{ background: "#0FFCBF", color: "#0A1628" }}
            >
              Upload Contract &rarr;
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-background py-10 border-t text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Saathi Sign. All rights reserved.</p>
      </footer>
    </div>
  );
}
