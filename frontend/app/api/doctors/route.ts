import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.OMNIMED_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialization = searchParams.get('specialization');

  const url = new URL(`${BACKEND_URL}/doctors`);
  if (specialization) url.searchParams.set('specialization', specialization);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Could not connect to OmniMed backend' },
      { status: 502 }
    );
  }
}
