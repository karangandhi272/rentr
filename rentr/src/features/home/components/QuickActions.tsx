import { Plus, MessageSquare, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: <Plus />, label: "Add Property", href: "/properties/new" },
        { icon: <MessageSquare />, label: "New Message", href: "/messages" },
        { icon: <FileText />, label: "Create Report", href: "/reports/new" },
        { icon: <Settings />, label: "Settings", href: "/settings" },
      ].map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="flex items-center gap-2 h-20 hover:bg-primary/5"
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};