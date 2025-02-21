import { NextResponse } from "next/server";
import { BuevoService } from "@/lib/buevoService";
import { ImapService } from "@/lib/imapService";
import { cookies } from "next/headers";

if (!process.env.BUEVO_API_KEY) throw new Error('BUEVO_API_KEY is not defined');
const buevoService = new BuevoService(process.env.BUEVO_API_KEY);

interface EmailMessage {
  id: string;
  sent_at?: string | Date;
  received_at?: string | Date;
}

export async function POST(request: Request) {
  try {
    const { action, leadEmail, userEmail, propertyId, message, subject } = await request.json();
    const cookieStore = cookies();
    const emailCredentials = (await cookieStore).get('email_credentials');

    switch (action) {
      case "sendMessage":
        const sendResult = await buevoService.sendEmail({
          from: userEmail,
          to: leadEmail,
          subject: subject || "Re: Property Inquiry",
          content: message,
        });
        return NextResponse.json(sendResult);

      case "getMessages":
        if (!propertyId || !leadEmail) {
          return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const imapMessages: EmailMessage[] = emailCredentials ? await getImapMessages(emailCredentials, leadEmail) : [];

        // Sort messages with proper type checking and date handling
        const sortedMessages = imapMessages.sort((a: EmailMessage, b: EmailMessage) => {
          const getMessageDate = (msg: EmailMessage) => {
            const date = msg.sent_at || msg.received_at;
            return date ? new Date(date).getTime() : 0;
          };
          
          return getMessageDate(a) - getMessageDate(b);
        });

        return NextResponse.json(sortedMessages);

      case "status":
        const hasCredentials = !!emailCredentials?.value;
        
        let imapConnected = false;
        if (hasCredentials) {
          try {
            const { user, password } = JSON.parse(emailCredentials.value);
            const imapService = new ImapService({ user, password });
            await imapService.testConnection();
            imapConnected = true;
          } catch (error) {
            console.error("IMAP connection test failed:", error);
          }
        }

        return NextResponse.json({
          isConnected: imapConnected && !!process.env.BUEVO_API_KEY,
          imapConnected,
          buevoConnected: !!process.env.BUEVO_API_KEY
        });

      case "disconnect":
        (await cookieStore).delete('email_credentials');
        return NextResponse.json({ success: true });

      case "initialize":
        const { email, password } = await request.json();
        // Verify IMAP credentials before saving
        try {
          const imapService = new ImapService({ user: email, password });
          await imapService.testConnection();
        } catch (error) {
          return NextResponse.json({ error: 'Invalid email credentials' }, { status: 400 });
        }

        (await cookieStore).set('email_credentials', JSON.stringify({ user: email, password }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Email service error:", error);
    return NextResponse.json(
      { error: "Failed to process email request" },
      { status: 500 }
    );
  }
}

async function getImapMessages(credentials: any, leadEmail: string): Promise<EmailMessage[]> {
  try {
    const { user, password } = JSON.parse(credentials.value);
    const imapService = new ImapService({ user, password });
    return (await imapService.getEmails(leadEmail)) as EmailMessage[];
  } catch (error) {
    console.error("IMAP error:", error);
    return [];
  }
}
