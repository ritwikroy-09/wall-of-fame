import { NextRequest, NextResponse } from 'next/server';
import { OTPService, isValidEmail } from '@/app/utils/EmailServices';

// Route to generate and send OTP
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    const result = await OTPService.generateAndSendOTP(email);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in OTP generation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate OTP' },
      { status: 500 }
    );
  }
}
