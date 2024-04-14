import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET(req: NextAuthRequest) {
  const token = await auth(req);
  return NextResponse.json(token);
}
