import type { Metadata } from 'next';
import './globals.css';
// import { SidebarProvider } from '@/components/ui/sidebar'; // Removed
import { SiteHeader } from '@/components/layout/site-header';
// import { MainNav } from '@/components/layout/main-nav'; // Removed
import { Toaster } from "@/components/ui/toaster";
// import { NetworkIcon } from 'lucide-react'; // Moved to SiteHeader or not needed if logo handles it

export const metadata: Metadata = {
  title: 'AlgoView',
  description: 'Visualize searching and sorting algorithms',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {/* SidebarProvider and MainNav removed */}
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
