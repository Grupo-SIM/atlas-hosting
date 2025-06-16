import Imap from 'imap';
import { decrypt } from '@/lib/encryption';

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: string;
  body?: string;
  html?: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  count: number;
  flags: string[];
}

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export class ImapEmailClient {
  private imap: Imap | null = null;
  private config: ImapConfig;

  constructor(config: ImapConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: this.config.username,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        tls: this.config.secure,
        tlsOptions: {
          rejectUnauthorized: false // For self-signed certificates
        }
      });

      if (!this.imap) {
        reject(new Error('Failed to create IMAP connection'));
        return;
      }

      this.imap.once('ready', () => {
        console.log('IMAP connection ready');
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('IMAP connection ended');
      });

      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }
  }

  async getFolders(): Promise<EmailFolder[]> {
    return new Promise((resolve, reject) => {
      if (!this.imap) {
        reject(new Error('IMAP connection not established'));
        return;
      }

      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const folders: EmailFolder[] = [];
        
        const parseBoxes = (boxList: Record<string, any>, prefix = '') => {
          Object.keys(boxList).forEach(name => {
            const box = boxList[name] as { flags?: string[]; children?: Record<string, any>; delimiter?: string };
            const fullName = prefix + name;
            
            folders.push({
              id: fullName.toLowerCase(),
              name: fullName,
              count: 0, // Will be updated when opening folder
              flags: box.flags || []
            });

            if (box.children) {
              parseBoxes(box.children, fullName + box.delimiter);
            }
          });
        };

        parseBoxes(boxes);
        resolve(folders);
      });
    });
  }

  async getEmails(folderName = 'INBOX', limit = 50): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      if (!this.imap) {
        reject(new Error('IMAP connection not established'));
        return;
      }

      this.imap.openBox(folderName, true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        if (box.messages.total === 0) {
          resolve([]);
          return;
        }

        const start = Math.max(1, box.messages.total - limit + 1);
        const end = box.messages.total;

        if (!this.imap) {
          reject(new Error('IMAP connection lost'));
          return;
        }

        const fetch = this.imap.seq.fetch(`${start}:${end}`, {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true
        });

        const emails: EmailMessage[] = [];

        fetch.on('message', (msg, seqno) => {
          const headers: Record<string, string> = {};
          let body = '';
          let hasAttachment = false;

          msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              if (info.which === 'TEXT') {
                body = buffer;
              } else {
                // Parse headers
                const lines = buffer.split('\r\n');
                lines.forEach(line => {
                  const match = line.match(/^([^:]+):\s*(.*)$/);
                  if (match) {
                    headers[match[1].toLowerCase()] = match[2];
                  }
                });
              }
            });
          });

          msg.once('attributes', (attrs) => {
            // Check for attachments
            if (attrs.struct) {
              const checkStruct = (struct: Record<string, any>): void => {
                if (Array.isArray(struct)) {
                  struct.forEach(checkStruct);
                } else if (struct.disposition && struct.disposition.type === 'attachment') {
                  hasAttachment = true;
                }
              };
              checkStruct(attrs.struct);
            }
          });

          msg.once('end', () => {
            const email: EmailMessage = {
              id: `${seqno}`,
              from: headers.from || 'Unknown',
              to: headers.to || 'Unknown',
              subject: headers.subject || 'No Subject',
              preview: this.extractPreview(body),
              date: headers.date ? new Date(headers.date) : new Date(),
              isRead: false, // Will be determined by flags
              isStarred: false,
              hasAttachment,
              folder: folderName.toLowerCase(),
              body: this.stripHtml(body),
              html: body
            };

            emails.push(email);
          });
        });

        fetch.once('error', (err) => {
          reject(err);
        });

        fetch.once('end', () => {
          // Sort by date (newest first)
          emails.sort((a, b) => b.date.getTime() - a.date.getTime());
          resolve(emails);
        });
      });
    });
  }

  async markAsRead(messageId: string, folderName = 'INBOX'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.imap) {
        reject(new Error('IMAP connection not established'));
        return;
      }

      this.imap.openBox(folderName, false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        if (!this.imap) {
          reject(new Error('IMAP connection lost'));
          return;
        }

        this.imap.seq.addFlags(messageId, '\\Seen', (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  async deleteMessage(messageId: string, folderName = 'INBOX'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.imap) {
        reject(new Error('IMAP connection not established'));
        return;
      }

      this.imap.openBox(folderName, false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        if (!this.imap) {
          reject(new Error('IMAP connection lost'));
          return;
        }

        this.imap.seq.addFlags(messageId, '\\Deleted', (err) => {
          if (err) {
            reject(err);
            return;
          }

          if (!this.imap) {
            reject(new Error('IMAP connection lost'));
            return;
          }

          this.imap.expunge((err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      });
    });
  }

  private extractPreview(text: string, maxLength = 150): string {
    // Strip HTML tags and get first part of text
    const stripped = this.stripHtml(text);
    const preview = stripped.replace(/\s+/g, ' ').trim();
    return preview.length > maxLength ? `${preview.substring(0, maxLength)}...` : preview;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
}

export async function createImapClient(accountConfig: {
  imapHost: string;
  imapPort: number;
  imapUsername: string;
  encryptedImapPassword: string;
  imapSecure: boolean;
}): Promise<ImapEmailClient> {
  const password = await decrypt(accountConfig.encryptedImapPassword);
  
  const config: ImapConfig = {
    host: accountConfig.imapHost,
    port: accountConfig.imapPort,
    secure: accountConfig.imapSecure,
    username: accountConfig.imapUsername,
    password
  };

  return new ImapEmailClient(config);
}
