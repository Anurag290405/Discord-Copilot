"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Channel Settings",
    href: "/channel-settings",
    icon: MessageSquare,
  },
  {
    title: "System Settings",
    href: "/system-settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Discord</h1>
              <p className="text-xs text-orange-500">Copilot</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2.5 rounded transition-colors duration-150",
                  isActive
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-slate-700 hover:bg-orange-500 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="bg-orange-100 rounded-lg p-3">
            <p className="text-xs text-slate-600">Logged in as</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 rounded bg-red-50 hover:bg-red-100 text-red-700 transition-colors duration-150 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
