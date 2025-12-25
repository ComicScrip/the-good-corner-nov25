import { createContext, type ReactNode, useContext } from "react";
import { type User, useProfileQuery } from "@/graphql/generated/schema";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  const value = {
    user: data?.me || null,
    loading,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
