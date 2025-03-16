import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeadWithResponses } from '@/api/leadResponses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface LeadResponseDetailsProps {
  leadId: string;
}

export function LeadResponseDetails({ leadId }: LeadResponseDetailsProps) {
  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => fetchLeadWithResponses(leadId),
    enabled: !!leadId
  });
  
  if (isLoading) return <div>Loading responses...</div>;
  if (error) return <div>Error loading responses</div>;
  if (!lead) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>Name:</div>
              <div className="font-medium">{lead.name}</div>
              <div>Email:</div>
              <div className="font-medium">{lead.email}</div>
              <div>Phone:</div>
              <div className="font-medium">{lead.number}</div>
              <div>Move-in Date:</div>
              <div className="font-medium">
                {new Date(lead.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium">Precheck Question Responses</h3>
            {lead.responses.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">No responses provided</p>
            ) : (
              <div className="space-y-3 mt-2">
                {lead.responses.map((item) => (
                  <div key={item.id} className="bg-muted/50 p-3 rounded-md">
                    <p className="font-medium text-sm">{item.question.question_text}</p>
                    <p className="mt-1">{item.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
