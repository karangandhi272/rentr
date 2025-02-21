import Imap from 'imap';
import { ParsedMail, simpleParser } from 'mailparser';

interface ImapConfig {
  user: string;
  password: string;
}

export class ImapService {
  private imap: Imap;

  constructor(config: ImapConfig) {
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });
  }

  async testConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.end();
        resolve(true);
      });

      this.imap.once('error', (err: any) => {
        reject(err);
      });

      this.imap.connect();
    });
  }

  async getEmails(searchEmail: string) {
    return new Promise((resolve, reject) => {
      const messages: any[] = [];
      let processingCount = 0;

      const checkComplete = () => {
        if (processingCount === 0) {
          this.imap.end();
          resolve(messages);
        }
      };

      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          const searchCriteria = [
            ['OR', ['FROM', searchEmail], ['TO', searchEmail]],
            ['SINCE', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
          ];

          this.imap.search(searchCriteria, (err, results) => {
            if (err) return reject(err);
            if (!results.length) return resolve([]);

            const fetch = this.imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg) => {
              processingCount++;
              let buffer = '';

              msg.on('body', (stream) => {
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });

                stream.once('end', async () => {
                  try {
                    const parsed = await simpleParser(buffer);
                    messages.push({
                      id: parsed.messageId || `temp-${Date.now()}-${Math.random()}`,
                      subject: parsed.subject || '(No subject)',
                      content: parsed.text || parsed.textAsHtml || '(No content)',
                      from_email: parsed.from?.value[0]?.address || 'unknown@sender.com',
                      to_email: Array.isArray(parsed.to) ? (parsed.to[0] as any).value[0].address : parsed.to?.value[0]?.address || 'unknown@recipient.com',
                      sent_at: parsed.date || new Date(),
                      attachments: parsed.attachments?.map(att => ({
                        filename: att.filename || 'attachment',
                        url: att.content ? `data:${att.contentType};base64,${att.content.toString('base64')}` : ''
                      })) || []
                    });
                  } catch (error) {
                    console.error('Failed to parse email:', error);
                  } finally {
                    processingCount--;
                    checkComplete();
                  }
                });
              });

              msg.once('error', (err) => {
                console.error('Message error:', err);
                processingCount--;
                checkComplete();
              });
            });

            fetch.once('error', (err) => {
              console.error('Fetch error:', err);
              if (processingCount === 0) {
                resolve(messages);
              }
            });

            fetch.once('end', () => {
              if (processingCount === 0) {
                this.imap.end();
                resolve(messages);
              }
            });
          });
        });
      });

      this.imap.once('error', (err: any) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }
}
