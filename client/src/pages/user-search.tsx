import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Search, User as UserIcon } from "lucide-react";
import type { User } from "@shared/schema";
import { UserRankBadge } from "@/components/user-rank-badge";
import { VerifiedBadge } from "@/components/verified-badge";

export default function UserSearch() {
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { search }],
    queryFn: async () => {
      const res = await fetch(
        `/api/users?search=${encodeURIComponent(search)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Search Members</h1>
        <p className="text-muted-foreground">
          Find and connect with other members of the RIVET Studios community.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-lg shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : users?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No users found matching "{search}"
          </div>
        ) : (
          users?.map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`}>
              <Card className="hover-elevate cursor-pointer transition-all border-none shadow-sm bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-background">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      <UserIcon className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate inline-flex items-center gap-1">
                        {user.username}
                        <VerifiedBadge isVerified={user.isVerified} size="sm" />
                      </span>
                      {user.isModerator && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                         Community Staff
                        </Badge>
                      )}
                    </div>
                    {user.userRank && (
                      <UserRankBadge rank={user.userRank} size="sm" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
