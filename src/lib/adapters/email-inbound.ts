import crypto from 'crypto';

export interface RawWebhookBody {
  headers?: string;
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  'message-id'?: string;
  signature?: string;
  timestamp?: string;
  token?: string;
}

export function parseSendGridInbound(body: Record<string, any>) {
  const envelope = typeof body.envelope === 'string' ? JSON.parse(body.envelope) : body.envelope;
  const messageId =
    body['message-id'] ||
    body.headers?.match(/Message-ID:\s*<([^>]+)>/i)?.[1] ||
    `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const from = body.from || envelope?.from || '';
  const to = body.to ? [body.to] : envelope?.to || [];

  return {
    messageId,
    from,
    to: Array.isArray(to) ? to : [to],
    subject: body.subject || '',
    textBody: body.text || '',
    htmlBody: body.html || '',
  };
}

export function verifyWebhookSignature(token: string, timestamp: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return true; // Development mode fallback
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(timestamp + token);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
