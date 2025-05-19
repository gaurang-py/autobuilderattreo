import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rm } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { 
        pages: true,
        seo: true // Include SEO records
      }
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Delete tenant and associated data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete SEO records first
      if (tenant.seo) {
        await tx.sEO.delete({
          where: { tenantId: tenant.id }
        });
      }

      // Delete page content
      for (const page of tenant.pages) {
        await tx.pageContent.delete({
          where: { id: page.id }
        });
      }

      // Delete tenant
      await tx.tenant.delete({
        where: { id: tenant.id }
      });
    });

    // Delete uploaded files
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads', slug);
      await rm(uploadDir, { recursive: true, force: true });
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue execution even if file deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
} 