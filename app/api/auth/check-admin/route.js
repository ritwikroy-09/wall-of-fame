import { ALLOWED_ADMIN } from '@/app/secrets';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email } = await request.json();
        const username = email.split('@')[0];
        const allowedAdmins = ALLOWED_ADMIN?.split(',').map(admin => admin.trim()) || [];
        
        return NextResponse.json({ 
            isAdmin: allowedAdmins.includes(username)
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 });
    }
}
