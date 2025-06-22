import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/app/utils/EmailServices';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
        const { email, subject, html } = body;

    if (!email) {
      return NextResponse.json({ message: 'Missing required field: email' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ message: 'Missing required field: subject' }, { status: 400 });
    }
    if (!html) {
      return NextResponse.json({ message: 'Missing required field: html' }, { status: 400 });
    }

    await EmailService.sendEmail(email, subject, html);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
