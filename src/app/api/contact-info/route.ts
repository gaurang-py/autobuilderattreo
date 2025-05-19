import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the most recent enquiry for this email
    const latestEnquiry = await prisma.enquiry.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!latestEnquiry) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: latestEnquiry,
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    );
  }
} 