import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export const PerformanceMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">92%</span>
            <span className="text-xs text-green-500 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> +2.1%
            </span>
          </div>
        </CardContent>
      </Card>
      {/* Add similar cards for "Average Rent" and "Revenue Growth" */}
    </div>
  );
};