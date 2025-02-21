interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class BuevoService {
  private apiKey: string;
  private baseUrl: string = 'https://api.buevo.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Buevo API key is required');
    }
    this.apiKey = apiKey;
  }

  async sendEmail(message: EmailMessage) {
    const response = await fetch(`${this.baseUrl}/email/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.content,
        attachments: message.attachments?.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          contentType: att.contentType,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Buevo API error: ${error.message}`);
    }

    return response.json();
  }

  async getMessages(params: { propertyId: string; leadEmail: string }) {
    const response = await fetch(`${this.baseUrl}/email/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        property_id: params.propertyId,
        email: params.leadEmail,
        limit: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Buevo API error: ${error.message}`);
    }

    const data = await response.json();
    return data.messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      from_email: msg.from,
      to_email: msg.to,
      sent_at: msg.sent_at,
      status: msg.status,
      subject: msg.subject,
      attachments: msg.attachments?.map((att: any) => ({
        filename: att.filename,
        url: att.url,
      })),
    }));
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
