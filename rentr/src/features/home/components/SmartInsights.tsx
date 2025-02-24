import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Users } from "lucide-react";

interface InsightData {
  type: 'opportunity' | 'alert' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: string;
}

interface SmartInsightsProps {
  properties: any[];
  leads: any[];
  metrics: {
    avgResponseTime: string;
    leadGrowth: string;
    totalProperties: number;
    activeLeads: number;
  };
}

const mockInsights: InsightData[] = [
  {
    type: 'opportunity',
    title: 'Price Optimization Available',
    description: 'Based on recent market data, increasing rent for "Sunset Apartments" by 8% could generate additional revenue while staying competitive.',
    impact: 'high',
    metric: 'Potential monthly increase: $450'
  },
  {
    type: 'alert',
    title: 'Response Time Needs Attention',
    description: 'Your average lead response time has increased to 6 hours. Properties with <2 hour response times see 3x higher conversion rates.',
    impact: 'medium',
    metric: 'Current avg. response: 6.2 hours'
  },
  {
    type: 'prediction',
    title: 'Seasonal Demand Spike',
    description: 'Historical data suggests a 40% increase in rental inquiries next month. Consider adjusting marketing budget.',
    impact: 'high',
    metric: 'Expected leads: 25-30'
  }
];

export const SmartInsights = ({  }: SmartInsightsProps) => {
  function getInsightColor(type: InsightData['type']) {
    const baseStyle = "p-3 rounded-full bg-opacity-10";
    switch (type) {
      case 'opportunity':
        return `${baseStyle} bg-emerald-100 text-emerald-600`;
      case 'alert':
        return `${baseStyle} bg-rose-100 text-rose-600`;
      case 'prediction':
        return `${baseStyle} bg-blue-100 text-blue-600`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-600`;
    }
  }

  function getImpactBadgeVariant(impact: InsightData['impact']): "default" | "secondary" | "destructive" | "outline" {
    switch (impact) {
      case 'high':
        return "destructive";
      case 'medium':
        return "secondary";
      case 'low':
        return "outline";
      default:
        return "default";
    }
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50 border-none shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            Smart Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Badge variant="outline" className="font-medium">
              Live Updates
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {mockInsights.map((insight, index) => (
            <div
              key={index}
              className="group relative p-4 rounded-xl border bg-white/70 backdrop-blur-sm
                        transition-all duration-300 hover:shadow-lg hover:scale-[1.01]
                        hover:bg-white/90"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-start gap-4 relative">
                <div className={getInsightColor(insight.type)}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <Badge 
                      variant={getImpactBadgeVariant(insight.impact)}
                      className="capitalize"
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.metric && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {insight.metric}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function getInsightIcon(type: InsightData['type']) {
  switch (type) {
    case 'opportunity':
      return <TrendingUp className="h-5 w-5" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5" />;
    case 'prediction':
      return <Users className="h-5 w-5" />;
    default:
      return <Sparkles className="h-5 w-5" />;
  }
}

