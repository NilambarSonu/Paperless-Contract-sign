import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";
import { Show, useClerk, useUser } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthButtons() {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <>
      <Show when="signed-out">
        <Link href="/sign-in">
          <Button variant="ghost" className="hidden sm:inline-flex bg-gradient-to-b from-[#A5EDFF]/50 to-[#A5EDFF]/10 backdrop-blur-xl border border-white/70 rounded-full text-[#4b5b75] font-inconsolata text-[24px] lg:text-[28px] font-medium tracking-[-0.03em] h-auto px-8 py-1.5 shadow-[0_8px_32px_rgba(165,237,255,0.3),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:from-[#A5EDFF]/60 hover:to-[#A5EDFF]/20 hover:shadow-[0_12px_40px_rgba(165,237,255,0.5),inset_0_2px_6px_rgba(255,255,255,1)] hover:scale-105 transition-all duration-300">
            Sign in
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="ghost" className="bg-gradient-to-b from-[#A5EDFF]/50 to-[#A5EDFF]/10 backdrop-blur-xl border border-white/70 rounded-full text-[#4b5b75] font-inconsolata text-[24px] lg:text-[28px] font-medium tracking-[-0.03em] h-auto px-8 py-1.5 shadow-[0_8px_32px_rgba(165,237,255,0.3),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:from-[#A5EDFF]/60 hover:to-[#A5EDFF]/20 hover:shadow-[0_12px_40px_rgba(165,237,255,0.5),inset_0_2px_6px_rgba(255,255,255,1)] hover:scale-105 transition-all duration-300">
            Get Started
          </Button>
        </Link>
      </Show>
      <Show when="signed-in">
        <span className="hidden sm:block text-sm text-[#4b5b75] font-medium truncate max-w-[160px] bg-white/40 px-3 py-1.5 rounded-full border border-white/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] backdrop-blur-sm">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <Button
          variant="ghost"
          className="bg-gradient-to-b from-[#A5EDFF]/40 to-[#A5EDFF]/10 backdrop-blur-xl border border-white/70 rounded-full text-[#4b5b75] font-inconsolata text-[20px] font-medium tracking-[-0.03em] h-auto px-6 py-1.5 shadow-[0_4px_16px_rgba(165,237,255,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:from-[#A5EDFF]/50 hover:to-[#A5EDFF]/20 hover:shadow-[0_8px_24px_rgba(165,237,255,0.4),inset_0_2px_6px_rgba(255,255,255,1)] hover:scale-105 transition-all duration-300"
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
        >
          Sign Out
        </Button>
      </Show>
    </>
  );
}

export function Navbar() {
  return (
    <nav className="w-full h-24 bg-transparent fixed top-0 z-50 flex items-center justify-between px-8 lg:px-16 pt-4">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
          <img src="/assets/hero/favicon-icon.png" alt="Saathi Sign Logo" className="w-full h-full object-cover" />
        </div>
        {/* Hiding the text to match Figma exactly, but keeping the link functionality */}
        <span className="sr-only">Saathi Sign</span>
      </Link>

      {/* Center: Navigation Links in a Glass Pill */}
      <div className="hidden md:flex items-center justify-center gap-12 font-imbue text-[32px] font-light text-[#5e718d] bg-gradient-to-b from-white/60 to-white/20 border border-white/70 backdrop-blur-xl rounded-full px-16 py-2 shadow-[0_8px_32px_rgba(31,38,135,0.08),inset_0_2px_6px_rgba(255,255,255,0.9)]">
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
        <Show when="signed-in">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </Show>
        <Show when="signed-out">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </Show>
      </div>

      {/* Right: Auth Buttons */}
      <div className="flex items-center gap-4">
        <AuthButtons />
      </div>
    </nav>
  );
}
