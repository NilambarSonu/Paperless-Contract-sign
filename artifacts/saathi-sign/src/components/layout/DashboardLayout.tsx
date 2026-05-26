import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, FileText, PlusCircle, Settings, PenTool, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/contracts", label: "Contracts", icon: FileText },
  { href: "/dashboard/contracts/new", label: "New Contract", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card shadow-sm fixed inset-y-0">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Saathi Sign</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:hidden sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Saathi Sign</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-16 flex items-center px-6 border-b">
                <span className="font-display font-bold text-lg">Menu</span>
              </div>
              <nav className="p-4 space-y-1">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
