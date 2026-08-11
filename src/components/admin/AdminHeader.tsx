"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Bell, Monitor, Moon, Search, Sun, User } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

type AdminHeaderProps = {
  readonly email: string;
};

function getEmailInitial(email: string): string {
  const local = email.split("@")[0] ?? "";
  return (local.charAt(0) || "?").toUpperCase();
}

export function AdminHeader({ email }: AdminHeaderProps) {
  const { logout, can } = useAuth();
  const { setTheme } = useTheme();
  const canEditSettings = can("settings:edit");

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <div className="min-w-0 flex-1">
        <AdminBreadcrumb />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="relative mr-1 hidden w-48 md:block lg:w-64">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search…"
            disabled
            aria-label="Search (coming soon)"
            className="border-border bg-muted/50 pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="size-4" />
          <span
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive"
            aria-hidden
          />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Account menu"
            >
              <Avatar size="sm">
                <AvatarFallback>{getEmailInitial(email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canEditSettings ? (
              <DropdownMenuItem asChild>
                <Link href="/admin/site-settings">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Monitor className="h-4 w-4" />
                Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent sideOffset={8} collisionPadding={8}>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void logout()}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
