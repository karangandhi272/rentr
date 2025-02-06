import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          "pb-20 md:pb-0",
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};
