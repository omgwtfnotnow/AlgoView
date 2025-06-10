'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, ListFilter, NetworkIcon, Search } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/search', label: 'Search Visualizer', icon: Search },
  { href: '/sort', label: 'Sort Visualizer', icon: ListFilter },
  { href: '/recommendations', label: 'Smart Suggestions', icon: Lightbulb },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <NetworkIcon className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl font-headline text-primary group-data-[collapsible=icon]:hidden">
            AlgoView
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, className: "text-xs" }}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} AlgoView
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
