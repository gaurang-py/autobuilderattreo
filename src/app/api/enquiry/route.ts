import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, phone, message, tenantSlug } = await request.json();

    // Validate required fields
    if (!name || !email || !message || !tenantSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Create enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        tenantId: tenant.id,
        name,
        email,
        phone: phone || null,
        message,
        status: 'new',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiryId: enquiry.id,
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
} 