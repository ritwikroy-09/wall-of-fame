// Route to verify OTP
import { NextRequest, NextResponse } from 'next/server';
import { OTPService, isValidEmail } from '@/app/utils/EmailServices';
import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

export async function PUT(req: NextRequest) {
    try {
      const { email, otp } = await req.json();
  
      if (!email || !isValidEmail(email) || !otp) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or OTP' },
          { status: 400 }
        );
      }
  
      const result = await OTPService.verifyOTP(email, otp);
      if (result.success) {
                // Generate JWT Token
        const token = jwt.sign(
          { email: email },
          SECRET_KEY
          );
      
      return NextResponse.json({...result,token});
    }
      return NextResponse.json(result, { status: 401 });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to verify OTP' },
        { status: 500 }
      );
    }
  }
  