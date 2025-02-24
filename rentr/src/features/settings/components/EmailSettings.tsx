import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface EmailSettingsProps {
  email: string;
}

export function EmailSettings({ email }: EmailSettingsProps) {
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status = { isConnected: false }, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["emailStatus"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/emailService", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });
      if (!response.ok) throw new Error("Failed to check status");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const handleConnect = async () => {
    if (!password.trim()) return;

    setIsConnecting(true);
    setHasAttemptedConnection(true);
    try {
      const response = await fetch("http://localhost:3000/api/emailService", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize",
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to connect");
      }

      await queryClient.invalidateQueries({ queryKey: ["emailStatus"] });
      
      toast({
        title: "Email Connected",
        description: "Your email has been successfully connected",
      });
      setPassword("");
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Please check your email password and try again",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>
          Connect your email to send and receive messages from leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={email} disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your email password"
          />
        </div>
        <Button
          onClick={handleConnect}
          disabled={!password.trim() || isConnecting || isCheckingStatus}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : status.isConnected ? (
            "Reconnect Email"
          ) : (
            "Connect Email"
          )}
        </Button>
        {hasAttemptedConnection && (
          isCheckingStatus ? (
            <p className="text-sm text-muted-foreground">Checking connection status...</p>
          ) : status.isConnected ? (
            <p className="text-sm text-green-600">✓ Email is connected</p>
          ) : (
            <p className="text-sm text-red-600">✗ Connection failed</p>
          )
        )}
      </CardContent>
    </Card>
  );
}
