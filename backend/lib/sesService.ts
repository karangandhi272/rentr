import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  content: string;
}

export class SESService {
  private ses: SESClient;

  constructor() {
    if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('AWS_ACCESS_KEY_ID is required');
    if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error('AWS_SECRET_ACCESS_KEY is required');
    if (!process.env.AWS_REGION) throw new Error('AWS_REGION is required');

    this.ses = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
  }

  async sendEmail(options: EmailOptions) {
    console.log('Attempting to send email via SES:', {
      from: options.from,
      to: options.to,
      subject: options.subject,
      timestamp: new Date().toISOString()
    });

    try {
      const command = new SendEmailCommand({
        Source: options.from,
        Destination: {
          ToAddresses: [options.to],
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.content,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const result = await this.ses.send(command);
      console.log('Email sent successfully:', {
        messageId: result.MessageId,
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      console.error('SES email error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        emailDetails: {
          from: options.from,
          to: options.to,
          subject: options.subject,
          hasContent: !!options.content
        },
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.ses.send(new SendEmailCommand({
        Source: process.env.AWS_SES_FROM_EMAIL,
        Destination: { ToAddresses: [process.env.AWS_SES_FROM_EMAIL] },
        Message: {
          Subject: { Data: 'SES Test', Charset: 'UTF-8' },
          Body: { Text: { Data: 'Test', Charset: 'UTF-8' } }
        }
      }));
      return true;
    } catch (error) {
      console.error('SES verification error:', error);
      return false;
    }
  }
}
