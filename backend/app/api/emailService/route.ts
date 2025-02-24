import { NextResponse } from "next/server";
import { SESService } from "@/lib/sesService";
import { ImapService } from "@/lib/imapService";
import { cookies } from "next/headers";

if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('AWS_ACCESS_KEY_ID is not defined');
if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error('AWS_SECRET_ACCESS_KEY is not defined');
if (!process.env.AWS_REGION) throw new Error('AWS_REGION is not defined');

const sesService = new SESService();

interface EmailMessage {
  id: string;
  sent_at?: string | Date;
  received_at?: string | Date;
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
      console.log('Received request:', {
        action: body.action,
        email: body.email,
        hasPassword: !!body.password,
        hasUserEmail: !!body.userEmail,
        hasLeadEmail: !!body.leadEmail,
      });
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { action, leadEmail, userEmail, propertyId, message, subject, email, password } = body;
    
    if (!action) {
      console.error('Missing action in request');
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // Log the current state
    console.log('Processing action:', action, {
      hasCredentials: !!(await cookies()).get('email_credentials'),
      hasEmail: !!email,
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    });

    const cookieStore = cookies();
    const emailCredentials = (await cookieStore).get('email_credentials');

    switch (action) {
      case "sendMessage":
        if (!userEmail || !leadEmail || !message) {
          const error = {
            code: 'MISSING_PARAMS',
            userEmail,
            leadEmail,
            hasMessage: !!message,
            timestamp: new Date().toISOString()
          };
          console.error('Send message validation failed:', error);
          return NextResponse.json({ 
            error: "Missing email parameters",
            details: error
          }, { status: 400 });
        }

        try {
          console.log('Initiating send message via SES:', {
            from: userEmail,
            to: leadEmail,
            hasMessage: !!message,
            timestamp: new Date().toISOString()
          });

          const sendResult = await sesService.sendEmail({
            from: userEmail,
            to: leadEmail,
            subject: subject || `Re: Property Inquiry`,
            content: `
              <div style="font-family: sans-serif;">
                <p>${message}</p>
              </div>
            `,
          });
          
          console.log('Message sent successfully via SES:', {
            result: sendResult,
            timestamp: new Date().toISOString()
          });

          return NextResponse.json(sendResult);
        } catch (error) {
          const errorDetails = {
            type: error instanceof Error ? error.constructor.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            context: {
              userEmail,
              leadEmail,
              hasMessage: !!message,
              hasSubject: !!subject
            }
          };
          
          console.error('Send message failed:', errorDetails);
          
          return NextResponse.json({ 
            error: "Failed to send message",
            details: errorDetails
          }, { status: 500 });
        }

      case "getMessages":
        if (!propertyId || !leadEmail) {
          console.error('Missing required parameters for getMessages:', { propertyId, leadEmail });
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
        
        const [sesConnected, imapConnected] = await Promise.all([
          sesService.verifyConnection(),
          hasCredentials ? testImapConnection(emailCredentials) : false
        ]);

        return NextResponse.json({
          isConnected: sesConnected || imapConnected,
          sesConnected,
          imapConnected
        });

      case "disconnect":
        (await cookieStore).delete('email_credentials');
        return NextResponse.json({ success: true });

      case "initialize":
        if (!email || !password) {
          console.error('Initialize failed: Missing credentials', {
            hasEmail: !!email,
            hasPassword: !!password
          });
          return NextResponse.json({ 
            error: 'Email and password are required',
            missing: {
              email: !email,
              password: !password
            }
          }, { status: 400 });
        }

        try {
          console.log('Starting IMAP connection test for:', email);
          const imapService = new ImapService({ user: email, password });
          await imapService.testConnection();
          console.log('IMAP connection test successful for:', email);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const isGmail = email.toLowerCase().endsWith('@gmail.com');
          const isAppPasswordError = errorMessage.includes('Application-specific password required');
          
          console.error('IMAP connection test failed:', {
            email,
            error: errorMessage,
            isGmail,
            isAppPasswordError,
            stack: error instanceof Error ? error.stack : undefined
          });

          if (isGmail && isAppPasswordError) {
            return NextResponse.json({ 
              error: 'Gmail requires an App Password for this connection',
              details: 'Please generate an App Password from your Google Account settings and use it instead of your regular password.',
              helpLink: 'https://support.google.com/accounts/answer/185833'
            }, { status: 400 });
          }

          return NextResponse.json({ 
            error: 'Invalid email credentials',
            details: errorMessage
          }, { status: 400 });
        }

        try {
          await (await cookieStore).set('email_credentials', JSON.stringify({ user: email, password }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60
          });
          console.log('Credentials stored successfully for:', email);
        } catch (error) {
          console.error('Failed to store credentials:', error);
          return NextResponse.json({ error: 'Failed to store credentials' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Email service error:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { 
        error: "Failed to process email request",
        details: error instanceof Error ? error.message : undefined
      },
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

async function testImapConnection(emailCredentials: any): Promise<boolean> {
  try {
    const { user, password } = JSON.parse(emailCredentials.value);
    const imapService = new ImapService({ user, password });
    await imapService.testConnection();
    return true;
  } catch (error) {
    console.error("IMAP connection test failed:", error);
    return false;
  }
}
