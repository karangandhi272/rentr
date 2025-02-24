import { Resend } from 'resend';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  content: string;
}

export class ResendService {
  private resend: Resend;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('Resend API key is required');
    this.resend = new Resend(apiKey);
  }

  async sendEmail(options: EmailOptions) {
    console.log('Attempting to send email:', {
      from: options.from,
      to: options.to,
      subject: options.subject,
      timestamp: new Date().toISOString()
    });

    try {
      if (!options.from || !options.to) {
        throw new Error(`Invalid email addresses - From: ${options.from}, To: ${options.to}`);
      }

      const result = await this.resend.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.content,
      });

      console.log('Email sent successfully:', {
        result,
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      console.error('Resend email error:', {
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
      await this.resend.domains.list();
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      return false;
    }
  }
}
