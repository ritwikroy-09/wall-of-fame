import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, errors } from "jose";
import { SECRET_KEY as ENV_SECRET_KEY } from '@/app/secrets';

const SECRET_KEY = new TextEncoder().encode(ENV_SECRET_KEY);

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        
        if (!body || !body.token) {
            return NextResponse.json(
                { error: 'Token is required in the request body' },
                { status: 400 }
            );
        }

        const { token } = body;

        try {
            const { payload } = await jwtVerify(token, SECRET_KEY);
            return NextResponse.json({ payload });
        } catch (jwtError) {
            if (jwtError instanceof errors.JWTExpired) {
                return NextResponse.json(
                    { error: 'Token has expired' },
                    { status: 401 }
                );
            }
            if (jwtError instanceof errors.JWTInvalid) {
                return NextResponse.json(
                    { error: 'Invalid token format' },
                    { status: 400 }
                );
            }
            if (jwtError instanceof errors.JWTClaimValidationFailed) {
                return NextResponse.json(
                    { error: 'Token claim validation failed' },
                    { status: 400 }
                );
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Token decryption error:', error);
        return NextResponse.json(
            { error: 'Internal server error during token processing' },
            { status: 500 }
        );
    }
}