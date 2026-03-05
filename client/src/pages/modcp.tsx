import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  MessageSquare,
  Shield,
  AlertTriangle,
  Ban,
  FileText,
  Clock,
  History,
  LayoutDashboard
} from "lucide-react";

interface ModStats {
  bansIssued: number;
  warningsGiven: number;
  notesAdded: number;
  hoursLogged: number;
}

export default function ModCP() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activePlayerSearch, setActivePlayerSearch] = useState("");

  const staffRanks = [
    "RS Volunteer Staff",
    "RS Trust & Safety Team",
    "Community Moderator",
    "Community Senior Moderator",
    "Community Administrator",
    "Community Senior Administrator",
    "Community Developer",
    "Staff Internal Affairs",
    "Company Representative",
    "Team Member",
    "MI Trust & Safety Director",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  const isMod =
    user?.isAdmin ||
    user?.isModerator ||
    staffRanks.includes(user?.userRank || "") ||
    (user?.additionalRanks || []).some((r: string) => staffRanks.includes(r));

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-3xl" />
      </div>
    );
  }

  if (!isMod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Card className="w-full max-w-md bg-[#121212] border-white/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div>
                <h2 className="font-black text-xl text-white uppercase tracking-tighter">Access Denied</h2>
                <p className="text-white/40 text-sm mt-2">
                  You do not have permission to access the Moderator Control Panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col p-4 space-y-2">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm italic">RS</span>
          </div>
          <span className="font-black text-sm tracking-tighter uppercase">RIVET Studios™</span>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-bold text-sm transition-all">
          <LayoutDashboard className="w-4 h-4" />
          Moderator Dashboard
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all">
          <AlertTriangle className="w-4 h-4" />
          Blacklist
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all">
          <Users className="w-4 h-4" />
          User Lookup
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all">
          <Shield className="w-4 h-4" />
          Moderation Actions
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all">
          <FileText className="w-4 h-4" />
          Reports
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Moderator Dashboard</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="Search..." 
              className="pl-10 bg-white/5 border-white/5 rounded-xl w-64 focus:ring-primary"
            />
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit">
          <button className="px-6 py-2 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center gap-2">
            <LayoutDashboard className="w-3 h-3" /> Dashboard
          </button>
          <button className="px-6 py-2 rounded-lg text-white/40 hover:text-white text-xs font-bold flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Comments <span className="bg-white/10 px-1.5 rounded-md text-[10px]">0</span>
          </button>
          <button className="px-6 py-2 rounded-lg text-white/40 hover:text-white text-xs font-bold flex items-center gap-2">
            <Users className="w-3 h-3" /> Forums
          </button>
          <button className="px-6 py-2 rounded-lg text-white/40 hover:text-white text-xs font-bold flex items-center gap-2">
            <Shield className="w-3 h-3" /> Support
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <Ban className="w-4 h-4" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Bans Issued</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">1,245</div>
              <div className="text-xs font-bold text-green-500 uppercase tracking-tighter">Last 30 Days: +87</div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <AlertTriangle className="w-4 h-4" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Warnings Given</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">3,567</div>
              <div className="text-xs font-bold text-green-500 uppercase tracking-tighter">Last 30 Days: +314</div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Active Player Lookup</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input 
                placeholder="Enter Player ID or Name" 
                className="bg-white/5 border-white/5 rounded-xl text-sm h-12"
              />
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Notes Added</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">8,901</div>
              <div className="text-xs font-bold text-white/20 uppercase tracking-tighter">New registrations for today: 12</div>
            </CardContent>
          </Card>
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121212] border-white/5 rounded-3xl p-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Your Contribution</h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm font-bold text-white/40 uppercase mb-2">Hours Logged This Month</div>
                <div className="text-5xl font-black text-green-500">52.3</div>
              </div>
              <div className="text-sm font-bold text-white/40 uppercase">Total Hours: 142.8</div>
            </div>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Redeem Your Hours</h3>
              <p className="text-sm text-white/40 font-bold uppercase tracking-tight">Redeem hours for rewards and gift cards</p>
            </div>
            <div className="space-y-4">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-16 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all">
                Redeem Gift Card
              </Button>
              <div className="text-center text-[10px] font-black text-white/20 uppercase tracking-widest">
                100 Hours = $10 Gift Card <br /> Terms & Conditions Apply
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Chart Placeholder */}
        <Card className="bg-[#121212] border-white/5 rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center">
           <div className="text-center space-y-2">
              <History className="w-12 h-12 text-white/10 mx-auto" />
              <h4 className="font-black uppercase tracking-tighter text-white/40">Daily Moderator Activity</h4>
              <p className="text-xs font-bold text-white/10 uppercase tracking-widest">Analytics visualization loading...</p>
           </div>
        </Card>
      </div>
    </div>
  );
}