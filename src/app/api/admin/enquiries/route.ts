import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const status = url.searchParams.get('status');
    
    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
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

    // Query conditions
    const where: any = { tenantId: tenant.id };
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Get enquiries
    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { enquiryId, status } = await request.json();

    if (!enquiryId || !status) {
      return NextResponse.json(
        { error: 'Enquiry ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['new', 'read', 'responded'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: new, read, responded' },
        { status: 400 }
      );
    }

    // Update enquiry status
    const updatedEnquiry = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      enquiry: updatedEnquiry,
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
} 