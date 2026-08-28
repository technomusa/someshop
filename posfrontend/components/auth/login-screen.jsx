"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function LoginScreen({ onLogin }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "admin@pos.com",
      password: "password",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error || "Login failed");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success("Logged in successfully");
        // Give NextAuth a moment to update session
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (onLogin) {
          onLogin();
        }
        router.push("/pos");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary">
            <Store className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">POS System</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-950/30">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pos.com"
                disabled={isLoading}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 1,
                    message: "Password must be provided",
                  },
                })}
              />
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
            <div className="text-center text-xs text-muted-foreground mt-4">
              Default: admin@pos.com / password
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
