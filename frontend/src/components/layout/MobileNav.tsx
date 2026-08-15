"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BarChart3, Target } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/today", icon: LayoutDashboard, label: "Today" },
    { href: "/journey", icon: Target, label: "Journey" },
    { href: "/history", icon: Calendar, label: "History" },
    { href: "/insights", icon: BarChart3, label: "Insights" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <nav className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-orange-100" : ""}`} />
              <span className="text-[10px] font-bold tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
