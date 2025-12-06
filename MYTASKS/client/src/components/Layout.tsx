import { Link, useLocation } from "wouter";
import { Calendar, CheckSquare, Folder, StickyNote, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: Calendar, label: "Inicio" },
  { href: "/tasks", icon: CheckSquare, label: "Tareas" },
  { href: "/folders", icon: Folder, label: "Carpetas" },
  { href: "/notes", icon: StickyNote, label: "Notas" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <nav className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2 px-2 py-6 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
          M
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">MYTASKS</span>
      </div>
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              {item.label}
              {isActive && (
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </a>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-sm fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50 flex items-center px-4 justify-center">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              M
            </div>
            <span className="font-heading font-bold text-lg">MYTASKS</span>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pt-0 md:pb-0 min-h-screen relative">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t z-50 pb-safe">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[64px]",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-full transition-all",
                    isActive ? "bg-primary/10" : "bg-transparent"
                  )}>
                    <item.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
