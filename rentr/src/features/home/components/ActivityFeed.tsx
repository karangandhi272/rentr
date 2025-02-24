import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  title: string;
  time: string;
  type: 'lead' | 'maintenance' | 'payment' | 'system';
  color: string;
}

const activities: Activity[] = [
  {
    id: '1',
    title: 'New lead received for Sunset Apartments',
    time: '2 minutes ago',
    type: 'lead',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Maintenance request completed at Ocean View',
    time: '1 hour ago',
    type: 'maintenance',
    color: 'bg-green-500'
  },
  {
    id: '3',
    title: 'Rent payment received from John Doe',
    time: '3 hours ago',
    type: 'payment',
    color: 'bg-purple-500'
  },
  {
    id: '4',
    title: 'Property inspection scheduled for Mountain Lodge',
    time: '5 hours ago',
    type: 'system',
    color: 'bg-orange-500'
  },
  {
    id: '5',
    title: 'Lease renewal reminder sent to Sarah Smith',
    time: '6 hours ago',
    type: 'system',
    color: 'bg-orange-500'
  },
  {
    id: '6',
    title: 'New maintenance request: Plumbing issue',
    time: 'Yesterday',
    type: 'maintenance',
    color: 'bg-green-500'
  },
  {
    id: '7',
    title: 'Property listing updated for Downtown Loft',
    time: 'Yesterday',
    type: 'system',
    color: 'bg-orange-500'
  },
  {
    id: '8',
    title: 'Security deposit returned to previous tenant',
    time: '2 days ago',
    type: 'payment',
    color: 'bg-purple-500'
  }
];

export const ActivityFeed = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 mb-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className={`w-2 h-2 mt-2 rounded-full ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <time className="text-xs text-muted-foreground">
                  {activity.time}
                </time>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};