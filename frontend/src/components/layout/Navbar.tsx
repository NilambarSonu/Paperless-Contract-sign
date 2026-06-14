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
          <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary/5">
            Log In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(16,110,190,0.5)]">
            Get Started
          </Button>
        </Link>
      </Show>
      <Show when="signed-in">
        <span className="hidden sm:block text-sm text-muted-foreground font-medium truncate max-w-[160px]">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5"
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
    <nav className="w-full h-16 border-b bg-background/80 backdrop-blur-md fixed top-0 z-50 flex items-center justify-between px-6 lg:px-12">
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">Saathi Sign</span>
      </Link>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
        <Show when="signed-in">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </Show>
      </div>
      <div className="flex items-center gap-4">
        <AuthButtons />
      </div>
    </nav>
  );
}
