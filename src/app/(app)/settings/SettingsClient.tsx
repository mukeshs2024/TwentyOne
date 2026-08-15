"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as Tabs from "@radix-ui/react-tabs";
import { User, Settings, Palette, Database, ShieldAlert, LogOut, Loader2, Save } from "lucide-react";
import { updateProfile, deleteAccount, exportData } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  name: string | null;
  availableTime: number | null;
};

export default function SettingsClient({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  
  // Profile State
  const [name, setName] = useState(profile.name || "");
  const [availableTime, setAvailableTime] = useState((profile.availableTime || 60).toString());
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Theme State
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     setMounted(true);
  }, []);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  if (!mounted) return null;

  const handleExport = async () => {
     setIsExporting(true);
     try {
        const jsonString = await exportData();
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `workspace_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
     } catch (e) {
        console.error("Export failed:", e);
     } finally {
        setIsExporting(false);
     }
  };

  const handleSaveProfile = async () => {
     setIsSavingProfile(true);
     try {
        await updateProfile({ name, availableTime: parseInt(availableTime, 10) });
        router.refresh();
     } catch (e) {
        console.error(e);
     } finally {
        setIsSavingProfile(false);
     }
  };

  const handleSignOut = async () => {
     const supabase = createClient();
     await supabase.auth.signOut();
     router.push("/login");
  };

  const handleDeleteAccount = async () => {
     if (deleteConfirm !== "DELETE") return;
     setIsDeleting(true);
     try {
        await deleteAccount();
        router.push("/register");
     } catch (e) {
        console.error(e);
        setIsDeleting(false);
     }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 h-full flex flex-col">
       <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 text-lg">Manage your workspace, preferences, and data.</p>
       </div>

       <Tabs.Root defaultValue="profile" className="flex flex-col md:flex-row gap-12 flex-1">
          {/* VERTICAL NAV */}
          <Tabs.List className="flex flex-col w-full md:w-64 gap-1 flex-shrink-0">
             <Tabs.Trigger value="profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                <User className="w-5 h-5" /> Profile
             </Tabs.Trigger>
             <Tabs.Trigger value="preferences" className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                <Settings className="w-5 h-5" /> Preferences
             </Tabs.Trigger>
             <Tabs.Trigger value="appearance" className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                <Palette className="w-5 h-5" /> Appearance
             </Tabs.Trigger>
             <Tabs.Trigger value="data" className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                <Database className="w-5 h-5" /> Data & Privacy
             </Tabs.Trigger>
             <div className="my-4 h-px bg-slate-200" />
             <Tabs.Trigger value="account" className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                <ShieldAlert className="w-5 h-5" /> Account
             </Tabs.Trigger>
          </Tabs.List>

          {/* CONTENT PANES */}
          <div className="flex-1 max-w-2xl">
             <Tabs.Content value="profile" className="outline-none space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                   <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                   
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                      <input 
                         type="text" 
                         value={name} 
                         onChange={e => setName(e.target.value)}
                         className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 transition-colors font-medium text-slate-900"
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Focus Goal (Minutes)</label>
                      <input 
                         type="number" 
                         value={availableTime} 
                         onChange={e => setAvailableTime(e.target.value)}
                         className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 transition-colors font-medium text-slate-900"
                      />
                      <p className="text-xs text-slate-500 font-medium">This drives the progression of your daily dashboard.</p>
                   </div>

                   <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button 
                         onClick={handleSaveProfile}
                         disabled={isSavingProfile || (name === (profile.name || "") && availableTime === (profile.availableTime || 60).toString())}
                         className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full px-8 shadow-md disabled:bg-slate-200 disabled:text-slate-400"
                      >
                         {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                      </Button>
                   </div>
                </div>
             </Tabs.Content>

             <Tabs.Content value="preferences" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center py-16">
                   <Settings className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-slate-900 mb-2">Regional Preferences</h3>
                   <p className="text-slate-500">Timezone and week-start settings will be automatically inferred from your browser in this version.</p>
                </div>
             </Tabs.Content>

             <Tabs.Content value="appearance" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                   <h2 className="text-xl font-bold text-slate-900 mb-8">Theme</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Theme Selectors */}
                      <div 
                         onClick={() => setTheme("light")}
                         className={`border-2 p-4 rounded-2xl cursor-pointer transition-all ${theme === 'light' ? 'border-orange-500 bg-slate-50' : 'border-transparent bg-slate-50 opacity-50 hover:opacity-100'}`}
                      >
                         <div className="w-full h-24 bg-white rounded-lg shadow-sm border border-slate-200 mb-3 flex items-center justify-center">
                            <span className="text-xs text-slate-400">Aa</span>
                         </div>
                         <p className="text-sm font-bold text-slate-900 text-center">Light</p>
                      </div>
                      <div 
                         onClick={() => setTheme("dark")}
                         className={`border-2 p-4 rounded-2xl cursor-pointer transition-all ${theme === 'dark' ? 'border-orange-500 bg-slate-50' : 'border-transparent bg-slate-50 opacity-50 hover:opacity-100'}`}
                      >
                         <div className="w-full h-24 bg-slate-900 rounded-lg shadow-sm border border-slate-700 mb-3 flex items-center justify-center">
                            <span className="text-xs text-slate-500">Aa</span>
                         </div>
                         <p className="text-sm font-bold text-slate-900 text-center">Dark</p>
                      </div>
                      <div 
                         onClick={() => setTheme("system")}
                         className={`border-2 p-4 rounded-2xl cursor-pointer transition-all ${theme === 'system' ? 'border-orange-500 bg-slate-50' : 'border-transparent bg-slate-50 opacity-50 hover:opacity-100'}`}
                      >
                         <div className="w-full h-24 bg-gradient-to-br from-white to-slate-900 rounded-lg shadow-sm border border-slate-200 mb-3 flex items-center justify-center">
                            <span className="text-xs text-slate-400 drop-shadow-sm">Aa</span>
                         </div>
                         <p className="text-sm font-bold text-slate-900 text-center">System</p>
                      </div>
                   </div>
                </div>
             </Tabs.Content>

             <Tabs.Content value="data" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                   <h2 className="text-xl font-bold text-slate-900">Data & Privacy</h2>
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                         <h3 className="font-bold text-slate-900">Export Workspace Data</h3>
                         <p className="text-sm text-slate-500 font-medium">Download all your records in JSON format.</p>
                      </div>
                      <Button 
                         variant="outline" 
                         onClick={handleExport}
                         disabled={isExporting}
                         className="font-bold rounded-full disabled:opacity-50"
                      >
                         {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                         Export JSON
                      </Button>
                   </div>
                </div>
             </Tabs.Content>

             <Tabs.Content value="account" className="outline-none space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                   <h2 className="text-xl font-bold text-slate-900">Security</h2>
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                      <div className="px-4 py-3 rounded-xl bg-slate-50 font-medium text-slate-500 border border-slate-100">
                         {email}
                      </div>
                   </div>
                   <div className="pt-4 border-t border-slate-100">
                      <Button variant="outline" onClick={handleSignOut} className="font-bold rounded-full text-slate-600">
                         <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </Button>
                   </div>
                </div>

                <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 space-y-6">
                   <div>
                      <h2 className="text-xl font-bold text-rose-700 mb-2">Danger Zone</h2>
                      <p className="text-rose-600 font-medium">
                         Deleting your account is permanent. All your execution history, learning records, and reviews will be instantly wiped from the database.
                      </p>
                   </div>
                   
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-rose-500 uppercase tracking-wider">Type DELETE to confirm</label>
                      <input 
                         type="text" 
                         value={deleteConfirm} 
                         onChange={e => setDeleteConfirm(e.target.value)}
                         placeholder="DELETE"
                         className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 focus:border-rose-500 focus:ring-0 transition-colors font-medium text-rose-900"
                      />
                   </div>

                   <Button 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== "DELETE" || isDeleting}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-12 shadow-sm disabled:bg-rose-200"
                   >
                      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Account Permanently"}
                   </Button>
                </div>
             </Tabs.Content>
          </div>
       </Tabs.Root>
    </div>
  );
}
