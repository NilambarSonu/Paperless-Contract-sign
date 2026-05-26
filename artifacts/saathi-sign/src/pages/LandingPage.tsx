import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { FileSignature, Lock, Globe, Zap, CheckCircle2 } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 gradient-hero text-white overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Professional Freelance Contracts & <span className="gradient-text">E-Signatures</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
            Securely send contracts, collect signatures, and receive legally trackable documents worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium text-lg px-8 glow-blue h-14">
                Upload Contract &rarr;
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-medium text-lg px-8 h-14 glass">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-b bg-card py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
          <div>
            <div className="text-3xl font-bold text-foreground">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Contracts Signed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">98%</div>
            <div className="text-sm text-muted-foreground mt-1">Completion Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">47</div>
            <div className="text-sm text-muted-foreground mt-1">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">Bank-grade</div>
            <div className="text-sm text-muted-foreground mt-1">Security</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Built for International Consultants</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to close deals professionally and securely.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileSignature, title: "Secure Digital Signing", desc: "Legally binding electronic signatures compliant with major international laws." },
            { icon: Zap, title: "Instant PDF Generation", desc: "Automatically compile signed documents with full audit trails." },
            { icon: Globe, title: "Geo/IP Tracking", desc: "Record signer location, IP address, and device information for security." },
            { icon: Lock, title: "Legal Audit Trail", desc: "Comprehensive logging of every step in the signing process." }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">A seamless experience for you and your clients.</p>
          </div>
          
          <div className="space-y-8">
            {[
              "Upload your contract (PDF/DOCX)",
              "Generate a secure signing link",
              "Client reviews and signs via link",
              "Signed PDF is generated instantly",
              "Both parties receive email confirmation"
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-6 bg-card p-6 rounded-xl shadow-sm border">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="font-medium text-lg">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-12 gradient-hero text-white text-center">
        <h2 className="font-display text-4xl font-bold mb-6">Ready to close deals faster?</h2>
        <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">Join top freelancers worldwide who trust Saathi Sign for their contracts.</p>
        <Link href="/dashboard">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 h-14 text-lg glow-mint">
            Start Free Trial
          </Button>
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="bg-background py-12 border-t text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Saathi Sign. All rights reserved.</p>
      </footer>
    </div>
  );
}
