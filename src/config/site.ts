export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
};

export const siteConfig = {
  name: "AlgoView",
  description: "Visualize searching and sorting algorithms.",
  mainNav: [
    {
      title: "Search Visualizer",
      href: "/search",
    },
    {
      title: "Sort Visualizer",
      href: "/sort",
    },
    {
      title: "Algorithm Recommendations",
      href: "/recommendations",
    },
  ] as NavItem[],
};
