"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AppMobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/today", icon: LayoutDashboard, label: "Today" },
    { href: "/journey", icon: Target, label: "Journey" },
    { href: "/insights", icon: BarChart3, label: "Insights" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] safe-area-bottom pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-[76px] px-2 relative">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 group min-h-[48px] min-w-[48px]"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobileNavIndicator"
                  className="absolute top-0 left-1/2 w-10 h-1 -translate-x-1/2 bg-orange-500 rounded-b-md"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <div className="flex items-center justify-center p-1.5 rounded-xl z-10 relative">
                 {isActive && (
                    <motion.div
                       layoutId="mobileNavBubble"
                       className="absolute inset-0 bg-orange-50 rounded-xl -z-10"
                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                 )}
                <Icon className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  isActive ? "text-orange-600 fill-orange-100" : "text-slate-400 group-hover:text-slate-600"
                )} />
              </div>
              
              <span className={cn(
                "text-[10px] font-bold tracking-wide transition-colors duration-300",
                isActive ? "text-orange-700" : "text-slate-500"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
