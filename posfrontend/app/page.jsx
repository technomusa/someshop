"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { usePOSStore } from "@/lib/store";
export default function Home() {
  const router = useRouter();
  const { currentUser, _hasHydrated } = usePOSStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && _hasHydrated && currentUser) {
      router.push("/pos");
    }
  }, [mounted, _hasHydrated, currentUser, router]);
  if (!mounted || !_hasHydrated) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>;
  }
  if (currentUser) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Redirecting...</div>
      </div>;
  }
  return <LoginScreen onLogin={() => router.push("/pos")} />;
}
