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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
  LayoutDashboard,
  Users,
  MessageSquare,
  Search,
  Clock,
  History,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  userRank: string;
  additionalRanks?: string[];
  vipTier: string;
}

interface ModStats {
  bansIssued: number;
  warningsGiven: number;
  notesAdded: number;
  hoursLogged: number;
}

export default function AdminCP() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activePlayerSearch, setActivePlayerSearch] = useState("");

  const adminRanks = [
    "Community Developer",
    "Staff Internal Affairs",
    "Company Representative",
    "Team Member",
    "MI Trust & Safety Director",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];

  const isAdmin =
    adminRanks.includes(user?.userRank || "") ||
    (user?.additionalRanks || []).some((r) => adminRanks.includes(r)) ||
    user?.email?.toLowerCase().endsWith("@resyncstudios.com");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Skeleton className="h-[600px] w-full max-w-[1400px] rounded-3xl" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
        <Card className="w-full max-w-md bg-[#121212] border-white/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div>
                <h2 className="font-semibold text-xl text-white uppercase tracking-tight">Access Denied</h2>
                <p className="text-white/40 text-sm mt-2">
                  You do not have permission to access the Administrator Control Panel.
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
            <span className="text-black font-semibold text-sm italic">RS</span>
          </div>
          <span className="font-semibold text-sm tracking-tight uppercase">RIVET Studios™</span>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-bold text-sm transition-all text-left">
          <LayoutDashboard className="w-4 h-4" />
          Admin Dashboard
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all text-left">
          <Users className="w-4 h-4" />
          User Management
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all text-left">
          <Shield className="w-4 h-4" />
          Platform Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all text-left">
          <MessageSquare className="w-4 h-4" />
          Announcements
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all text-left">
          <AlertTriangle className="w-4 h-4" />
          System Reports
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight uppercase">Administrator Dashboard</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="Search users..." 
              className="pl-10 bg-white/5 border-white/5 rounded-xl w-64 focus:ring-primary"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Total Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold mb-1">24,562</div>
              <div className="text-xs font-bold text-green-500 uppercase tracking-tight">Growth: +12%</div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Active Now</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold mb-1">1,842</div>
              <div className="text-xs font-bold text-green-500 uppercase tracking-tight">Peak: 2,450</div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <Shield className="w-4 h-4" />
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Admin Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold mb-1">452</div>
              <div className="text-xs font-bold text-white/20 uppercase tracking-tight">Today: 12</div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-white/5 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                <AlertTriangle className="w-4 h-4" />
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest">Pending Reports</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold mb-1">14</div>
              <div className="text-xs font-bold text-red-500 uppercase tracking-tight">Critical: 2</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#121212] border-white/5 rounded-3xl p-8">
            <h3 className="text-2xl font-semibold uppercase tracking-tight mb-8">Platform Health</h3>
            <div className="min-h-[250px] flex items-center justify-center border border-white/5 rounded-2xl bg-white/[0.02]">
               <div className="text-center">
                  <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-xs font-semibold text-white/20 uppercase tracking-widest">Live metrics visualization</p>
               </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-[#121212] border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-semibold uppercase tracking-tight mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-white/5 hover:bg-white/5 h-12 rounded-xl font-bold">
                  <Plus className="w-4 h-4 mr-3" /> New Announcement
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/5 hover:bg-white/5 h-12 rounded-xl font-bold">
                  <Shield className="w-4 h-4 mr-3" /> Manage Staff
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/5 hover:bg-white/5 h-12 rounded-xl font-bold">
                  <Users className="w-4 h-4 mr-3" /> Export User Data
                </Button>
              </div>
            </Card>

            <Card className="bg-red-500/10 border-red-500/20 rounded-3xl p-8">
              <h3 className="text-xl font-semibold uppercase tracking-tight text-red-500 mb-2">Emergency</h3>
              <p className="text-xs font-bold text-red-500/60 uppercase mb-4">Maintenance Mode</p>
              <Button className="w-full bg-red-600 hover:bg-red-700 h-14 rounded-xl font-semibold uppercase tracking-tight active:scale-95 transition-all">
                Enable Offline Mode
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
