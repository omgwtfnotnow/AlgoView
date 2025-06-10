import Link from 'next/link';
// import { SidebarTrigger } from '@/components/ui/sidebar'; // Removed
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Lightbulb, ListFilter, NetworkIcon, Search, Waypoints } from 'lucide-react';

const visualizerNavItems = [
  { href: '/search', label: 'Search Visualizer', icon: Search },
  { href: '/sort', label: 'Sort Visualizer', icon: ListFilter },
  { href: '/graph', label: 'Graph Visualizer', icon: Waypoints },
];

const aiToolsNavItems = [
  { href: '/recommendations', label: 'Smart Suggestions', icon: Lightbulb },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center"> {/* Always show brand */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <NetworkIcon className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              AlgoView
            </span>
          </Link>
        </div>
        
        <Menubar className="rounded-none border-b-0 border-t-0 border-l-0 border-r-0 p-0 h-auto bg-transparent">
          <MenubarMenu>
            <MenubarTrigger className="h-auto py-1 px-2 text-sm">Visualizers</MenubarTrigger>
            <MenubarContent>
              {visualizerNavItems.map((item) => (
                <MenubarItem key={item.href} asChild className="cursor-pointer">
                  <Link href={item.href} className="flex items-center w-full px-2 py-1.5">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="h-auto py-1 px-2 text-sm">AI Tools</MenubarTrigger>
            <MenubarContent>
              {aiToolsNavItems.map((item) => (
                <MenubarItem key={item.href} asChild className="cursor-pointer">
                  <Link href={item.href} className="flex items-center w-full px-2 py-1.5">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Add any header actions here, e.g., theme toggle, user profile */}
        </div>
      </div>
    </header>
  );
}
