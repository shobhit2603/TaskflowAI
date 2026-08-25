"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Welcome back</h2>
        <p className="text-xs text-muted-foreground">Sign in to continue</p>
      </div>

      {/* Server error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
          <p className="text-xs text-destructive">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(login)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-xs text-muted-foreground">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={cn(
              "h-10 bg-background/50 border-border/60 text-sm",
              errors.email && "border-destructive/50"
            )}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="login-password" className="text-xs text-muted-foreground">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(
              "h-10 bg-background/50 border-border/60 text-sm",
              errors.password && "border-destructive/50"
            )}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium",
            "bg-primary text-primary-foreground",
            "transition-all duration-150 active:scale-[0.98]",
            "shadow-lg shadow-primary/20",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "hover:bg-primary/90"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Sign in <ArrowRight className="h-3.5 w-3.5" /></>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="text-foreground font-medium hover:text-primary transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
