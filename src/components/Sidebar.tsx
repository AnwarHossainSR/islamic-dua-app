import {
  Activity,
  BookOpen,
  Brain,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Logs,
  Menu,
  Settings,
  Shield,
  Target,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const navigationGroups = [
  {
    name: "Overview",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { name: "AI Assistant", href: "/ai", icon: Brain },
    ],
  },
  {
    name: "Content",
    icon: BookOpen,
    items: [
      { name: "Challenges", href: ROUTES.CHALLENGES, icon: Target },
      { name: "Missed Challenges", href: ROUTES.MISSED_CHALLENGES, icon: Calendar },
      { name: "Duas", href: ROUTES.DUAS, icon: BookOpen },
      { name: "Activities", href: ROUTES.ACTIVITIES, icon: Activity },
    ],
  },
  {
    name: "Management",
    icon: Users,
    items: [
      { name: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
      { name: "Permissions", href: ROUTES.ADMIN_PERMISSIONS, icon: Shield },
      { name: "Logs", href: ROUTES.ADMIN_LOGS, icon: Logs },
      { name: "Settings", href: ROUTES.SETTINGS, icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((name) => name !== groupName) : [...prev, groupName]
    );
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-border bg-card transition-transform duration-300 ease-in-out md:sticky md:top-16 md:w-[18%] md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="space-y-4 p-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold">Super Admin Panel</h2>
            <p className="text-sm text-muted-foreground">System Management</p>
          </div>

          <nav className="space-y-2">
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.name);
              const hasActiveItem = group.items.some((item) => location.pathname === item.href);

              return (
                <div key={group.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      hasActiveItem
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="h-4 w-4" />
                      {group.name}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-4 space-y-1 border-l border-border pl-4">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-3 w-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>

          <div className="mt-4 pt-4 border-t">
            <Badge className="w-full justify-center">Super Admin</Badge>
          </div>
        </div>
      </aside>
    </>
  );
}
