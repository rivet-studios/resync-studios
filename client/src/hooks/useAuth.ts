import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  }) as { data: User | undefined; isLoading: boolean };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
