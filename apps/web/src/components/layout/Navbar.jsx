"use client";

import { Menu, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import { useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user } = useAuthStore();
  const { toggleSidebar, setMobileSidebarOpen, openTaskForm } = useTaskStore();
  const logout = useLogout();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center h-full px-4 gap-3">

        {/* Hamburger — desktop toggles sidebar, mobile opens Sheet */}
        <button
          onClick={() => {
            // On desktop: toggle collapse. On mobile: open Sheet.
            // We check screen width via CSS media logic indirectly:
            // The sheet won't show on desktop (Sheet handles this gracefully),
            // so we toggle the desktop sidebar state and also open the mobile sheet.
            // The Sidebar component renders each appropriately.
            toggleSidebar();
            setMobileSidebarOpen(true);
          }}
          className={cn(
            "lg:hidden flex h-8 w-8 items-center justify-center rounded-lg",
            "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          )}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "hidden lg:flex h-8 w-8 items-center justify-center rounded-lg",
            "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Brand — visible when sidebar is collapsed or on mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13H11L10 22L20.5 11H14L13 2Z"
                fill="currentColor" className="text-primary-foreground" />
            </svg>
          </div>
          <span className="font-semibold text-sm">TaskflowAI</span>
        </div>

        <div className="flex-1" />

        {/* New Task button */}
        <button
          onClick={() => openTaskForm()}
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-[0.97] transition-all duration-100",
            "shadow-sm shadow-primary/20"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* User avatar + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive text-sm"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
