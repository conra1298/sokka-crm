import { NextRequest, NextResponse } from 'next/server';
import { processInboundEmail } from '@/lib/services/email-capture.service';
import { parseSendGridInbound } from '@/lib/adapters/email-inbound';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: any;

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const formData = await request.formData();
      const obj: Record<string, any> = {};
      formData.forEach((value, key) => {
        obj[key] = value;
      });
      payload = parseSendGridInbound(obj);
    }

    if (!payload.messageId || !payload.from) {
      return NextResponse.json({ error: 'Missing messageId or from address' }, { status: 400 });
    }

    const result = await processInboundEmail({
      messageId: payload.messageId,
      from: payload.from,
      to: payload.to || [],
      subject: payload.subject,
      textBody: payload.textBody || payload.text,
      htmlBody: payload.htmlBody || payload.html,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 500 });
  }
}
