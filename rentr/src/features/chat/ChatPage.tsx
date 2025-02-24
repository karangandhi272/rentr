import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Loader2,
  Paperclip,
  SendHorizontal,
  RefreshCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Message {
  id: string;
  content: string;
  from_email: string;
  to_email: string;
  sent_at?: string;
  received_at?: string;
  status: string;
  subject?: string;
  attachments?: Array<{ filename: string; url: string }>;
  raw_email?: any;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState("");

  // Fetch lead details
  const { data: leadDetails } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*, property_details:property(*)")
        .eq("id", leadId)
        .single();
      return data;
    },
  });

  // Add this query to check email connection status
  const { data: emailStatus } = useQuery({
    queryKey: ["emailStatus"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/emailService", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });
      if (!response.ok) throw new Error("Failed to get email status");
      return response.json();
    },
  });

  // Fetch messages directly from API
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat_messages", leadId],
    queryFn: async () => {
      if (!leadDetails?.property || !leadDetails.email || !emailStatus?.isConnected)
        return [];

      // Fetch messages via IMAP
      const response = await fetch("http://localhost:3000/api/emailService", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "getMessages",
          leadEmail: leadDetails.email,
          propertyId: leadDetails.property 
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      const messages = await response.json();

      // Sort messages by date
      return messages.sort((a: { sent_at: any; received_at: any; }, b: { sent_at: any; received_at: any; }) => {
        const dateA = new Date(a.sent_at || a.received_at || 0);
        const dateB = new Date(b.sent_at || b.received_at || 0);
        return dateA.getTime() - dateB.getTime();
      });
    },
    enabled: !!leadDetails && emailStatus?.isConnected,
    refetchInterval: emailStatus?.isConnected ? 10000 : false,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle email connection

  // Handle message sending
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !leadDetails || !user?.email) return;

    try {
      const response = await fetch("http://localhost:3000/api/emailService", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          leadEmail: leadDetails.email,
          userEmail: user.email,
          propertyId: leadDetails.property,
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setInputMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat_messages", leadId] });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="font-semibold">{leadDetails?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {leadDetails?.property_details?.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["chat_messages", leadId],
                })
              }
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(`mailto:${leadDetails?.email}`)}
            >
              <Mail className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.from_email === user?.email
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="flex items-end max-w-[75%] space-x-2">
                  {msg.from_email !== user?.email && (
                    <Avatar className="h-6 w-6 mb-1">
                      <AvatarFallback>
                        {leadDetails?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.from_email === user?.email
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {msg.subject && (
                      <p className="text-xs opacity-70 mb-1">
                        Re: {msg.subject}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((file, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs"
                            onClick={() => window.open(file.url)}
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            {file.filename}
                          </Button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <time className="text-xs opacity-70">
                        {format(
                          new Date(
                            msg.sent_at || msg.received_at || Date.now()
                          ),
                          "HH:mm"
                        )}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-white pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-4">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                emailStatus?.isConnected
                  ? "Type a message..."
                  : "Connecting to email..."
              }
              disabled={!emailStatus?.isConnected}
              className="flex-1 py-6"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled={!inputMessage.trim() || !emailStatus?.isConnected}
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
