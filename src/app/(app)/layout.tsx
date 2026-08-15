import { getRequireProfile as getProfile } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppMobileNav } from "@/components/layout/AppMobileNav";
import { PageTransition } from "@/components/layout/PageTransition";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <AppSidebar profile={profile} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden relative">
        <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 pb-[100px] md:pb-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        
        {/* Mobile Navigation */}
        <AppMobileNav />
      </main>
    </div>
  );
}
