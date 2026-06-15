import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, FileText, PlusCircle, Settings, FileSignature, Menu, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useClerk, useUser, Show } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const NAV_ITEMS = [
  { href: "/dashboard",               label: "Overview",     icon: Home,        desc: "Stats & activity" },
  { href: "/dashboard/contracts",     label: "Contracts",    icon: FileText,     desc: "All contracts" },
  { href: "/dashboard/contracts/new", label: "New Contract", icon: PlusCircle,   desc: "Create new" },
  { href: "/settings",                label: "Settings",     icon: Settings,     desc: "Preferences" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <div className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? "nav-item-active"
                : "nav-item-hover text-slate-400"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isActive
                ? "bg-[#106EBE]/30 text-white"
                : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{item.label}</span>
            {isActive && <ChevronRight className="w-3 h-3 ml-auto text-[#0FFCBF]/60" />}
          </Link>
        );
      })}
    </div>
  );
}

function SidebarUser() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}` : email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Show when="signed-in">
      <div className="border-t border-white/8 pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#106EBE] to-[#0FFCBF] flex items-center justify-center text-xs font-bold text-[#0A1628] shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate capitalize">{name}</p>
            <p className="text-[11px] text-slate-500 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/6 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </Show>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f8fd] flex">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0" style={{ background: "linear-gradient(180deg, #070f1e 0%, #0A1628 60%, #0d1a30 100%)" }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#106EBE] rounded-lg flex items-center justify-center group-hover:bg-[#0d5fa3] transition-colors shadow-lg shadow-[#106EBE]/30 overflow-hidden">
              <img src="/favicon.png" alt="Saathi Sign Icon" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Saathi Sign</span>
          </Link>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Navigation</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <NavLinks />
        </nav>

        {/* User + Sign out */}
        <div className="px-3 pb-4">
          <SidebarUser />
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="flex-1 md:pl-64 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:hidden sticky top-0 z-40 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#106EBE] rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="Saathi Sign Icon" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-[#0A1628] text-base">Saathi Sign</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-0"
              style={{ background: "linear-gradient(180deg, #070f1e 0%, #0A1628 100%)" }}
            >
              <div className="h-16 flex items-center px-5 border-b border-white/6">
                <span className="font-display font-bold text-white text-lg">Menu</span>
              </div>
              <div className="px-3 pt-5">
                <NavLinks />
              </div>
              <div className="px-3 pb-4 mt-auto">
                <SidebarUser />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
