export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  readonly id: string;
  readonly name: string;
  isActive(): boolean;
  getPriority(): number;
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}
