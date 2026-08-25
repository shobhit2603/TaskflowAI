"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "All Tasks", icon: ListTodo },
];

/**
 * Sidebar — desktop sidebar + mobile Sheet drawer.
 *
 * Desktop: collapsible sidebar (controlled by isSidebarOpen in taskStore).
 * Mobile: Sheet that opens from the left, triggered by hamburger in Navbar.
 */
export default function Sidebar() {
  const { isSidebarOpen, isMobileSidebarOpen, setMobileSidebarOpen } = useTaskStore();
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen shrink-0 border-r border-sidebar-border bg-sidebar",
          "transition-all duration-300 ease-in-out overflow-hidden",
          isSidebarOpen ? "w-56" : "w-0"
        )}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile Sheet ──────────────────────────────────────────────── */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-sidebar border-sidebar-border"
        >
          <SidebarContent pathname={pathname} onNavClick={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarContent({ pathname, onNavClick }) {
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-sidebar-border">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13H11L10 22L20.5 11H14L13 2Z"
              fill="currentColor" className="text-primary-foreground" />
          </svg>
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground">TaskflowAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Menu
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-100",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-sidebar-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
            >
              Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
