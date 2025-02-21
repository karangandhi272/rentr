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

interface EmailSettingsProps {
  email: string;
  isConnected: boolean;
}

export function EmailSettings({ email, isConnected }: EmailSettingsProps) {
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!password.trim()) return;

    setIsConnecting(true);
    try {
      const response = await fetch("/api/emailService", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize",
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect");
      }

      toast({
        title: "Email Connected",
        description: "Your email has been successfully connected",
      });
      setPassword("");
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your email password and try again",
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
          disabled={!password.trim() || isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Email"
          )}
        </Button>
        {isConnected && (
          <p className="text-sm text-green-600">✓ Email is connected</p>
        )}
      </CardContent>
    </Card>
  );
}
