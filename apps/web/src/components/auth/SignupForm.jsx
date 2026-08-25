"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  name: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
});

export default function SignupForm() {
  const { mutate: signup, isPending, error } = useSignup();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Create account</h2>
        <p className="text-xs text-muted-foreground">Start managing tasks smarter with AI</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
          <p className="text-xs text-destructive">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(signup)} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="signup-name" className="text-xs text-muted-foreground">Full name</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Your Name"
            autoComplete="name"
            className={cn("h-10 bg-background/50 border-border/60 text-sm", errors.name && "border-destructive/50")}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs text-muted-foreground">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={cn("h-10 bg-background/50 border-border/60 text-sm", errors.email && "border-destructive/50")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-xs text-muted-foreground">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            className={cn("h-10 bg-background/50 border-border/60 text-sm", errors.password && "border-destructive/50")}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium mt-1",
            "bg-primary text-primary-foreground",
            "transition-all duration-150 active:scale-[0.98]",
            "shadow-lg shadow-primary/20 hover:bg-primary/90",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Create account <ArrowRight className="h-3.5 w-3.5" /></>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-medium hover:text-primary transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
