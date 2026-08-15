"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, BarChart3, Calendar, Settings, LogOut, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileSnippet {
  name: string | null;
  availableTime: number | null;
}

export function AppSidebar({ profile }: { profile: ProfileSnippet }) {
  const pathname = usePathname();

  const workLinks = [
    { href: "/today", icon: LayoutDashboard, label: "Today" },
  ];

  const progressLinks = [
    { href: "/journey", icon: Target, label: "Journey" },
    { href: "/insights", icon: BarChart3, label: "Insights" },
    { href: "/history", icon: Calendar, label: "History" },
  ];

  const bottomLinks = [
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const getInitial = (name: string | null) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <aside className="hidden md:flex flex-col w-[260px] border-r border-slate-200 bg-white h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">TwentyOne.</span>
        </div>

        {/* Profile Card */}
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-700">
            {getInitial(profile.name)}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-slate-900">{profile.name || "User"}</p>
            <p className="truncate text-xs font-medium text-slate-500">
              {profile.availableTime || 0}m daily focus
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Work</h3>
             <nav className="space-y-1 font-medium">
               {workLinks.map((link) => {
                 const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                 const Icon = link.icon;
                 
                 return (
                   <Link
                     key={link.href}
                     href={link.href}
                     className={cn(
                       "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 group",
                       isActive
                         ? "bg-slate-900 text-white font-semibold shadow-sm"
                         : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                     )}
                   >
                     <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                     {link.label}
                   </Link>
                 );
               })}
             </nav>
          </div>

          <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Progress</h3>
             <nav className="space-y-1 font-medium">
               {progressLinks.map((link) => {
                 const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                 const Icon = link.icon;
                 
                 return (
                   <Link
                     key={link.href}
                     href={link.href}
                     className={cn(
                       "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 group",
                       isActive
                         ? "bg-slate-900 text-white font-semibold shadow-sm"
                         : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                     )}
                   >
                     <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                     {link.label}
                   </Link>
                 );
               })}
             </nav>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6">
        <nav className="space-y-1.5 font-medium">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:scale-110" />
                {link.label}
              </Link>
            );
          })}
          
          <form action="/auth/logout" method="POST" className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-500 transition-transform duration-200 group-hover:scale-110" />
              Sign Out
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
