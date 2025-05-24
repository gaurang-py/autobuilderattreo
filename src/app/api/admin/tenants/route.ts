import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Upload image to ImageBB
async function uploadToImageBB(imageData: string) {
  try {
    // Extract base64 data if it's a data URL
    const base64Data = imageData.startsWith('data:') 
      ? imageData.split(',')[1] 
      : imageData;
    
    // If it's already a URL (not a base64 string), return it as is
    if (imageData.startsWith('http')) {
      return imageData;
    }
    
    const apiKey = process.env.IMAGEBB_API_KEY;
    if (!apiKey) {
      throw new Error('ImageBB API key not configured');
    }
    
    const formData = new FormData();
    formData.append('image', base64Data);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`ImageBB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Error uploading image to ImageBB:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        slug: true,
        companyName: true,
        template: true,
        logoUrl: true,
        favicon: true,
        createdAt: true,
        contactInfo: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') as string;
    const companyName = formData.get('companyName') as string;
    const template = formData.get('template') as string;
    const logoUrl = formData.get('logoUrl') as string;
    const faviconUrl = formData.get('faviconUrl') as string;
    const websiteImageUrl = formData.get('websiteImageUrl') as string;
    const industry = formData.get('industry') as string;
    
    // SEO fields
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const seoKeywords = formData.get('seoKeywords') as string;
    
    // Contact information
    const contactEmail = formData.get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const contactAddress = formData.get('contactAddress') as string;
    
    // Theme colors
    let themeColors = null;
    const themeColorsJson = formData.get('themeColors') as string;
    if (themeColorsJson) {
      try {
        themeColors = JSON.parse(themeColorsJson);
      } catch (e) {
        console.error('Failed to parse theme colors:', e);
      }
    }

    // Validate inputs
    if (!slug || !companyName || !template || !logoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }

    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Tenant with this slug already exists' },
        { status: 400 }
      );
    }

    // Upload images to ImageBB if they are base64 data
    let uploadedLogoUrl = logoUrl;
    let uploadedFaviconUrl = faviconUrl;
    let uploadedWebsiteImageUrl = websiteImageUrl;

    try {
      if (logoUrl && logoUrl.startsWith('data:')) {
        uploadedLogoUrl = await uploadToImageBB(logoUrl);
      }
      
      if (faviconUrl && faviconUrl.startsWith('data:')) {
        uploadedFaviconUrl = await uploadToImageBB(faviconUrl);
      }
      
      if (websiteImageUrl && websiteImageUrl.startsWith('data:')) {
        uploadedWebsiteImageUrl = await uploadToImageBB(websiteImageUrl);
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      return NextResponse.json(
        { error: `Failed to upload images: ${error.message}` },
        { status: 500 }
      );
    }

    // Generate content using AI
    const contentPrompt = `Create content for a website for a company called "${companyName}"${industry ? ` in the ${industry} industry` : ''}. 
    Include a home title, tagline, about us section, and a contact section blurb.
    Make the content detailed and professional, with at least 150-200 words for the about us section.
    Format the response as JSON with keys: homeTitle, tagline, aboutUs, contactBlurb`;

    // Generate services separately with more specific prompt
    const servicesPrompt = `Create 3-5 services with titles and descriptions for a company called "${companyName}"${industry ? ` in the ${industry} industry` : ''}.
    Make the services realistic and specific that would be offered by this type of company.
    Each service should have a concise title and a detailed description (30-50 words each).
    Format the response as JSON with an array of objects with title and description keys.
    Example format: [{"title": "Service Name", "description": "Service description here"}]`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Import GoogleGenerativeAI
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      // Generate general content
      const contentResult = await model.generateContent(contentPrompt);
      const contentResponse = await contentResult.response;
      const contentText = contentResponse.text();
      
      // Extract content JSON from the response
      const contentJsonMatch = contentText.match(/\{[\s\S]*\}/);
      let websiteContent = {
        homeTitle: `Welcome to ${companyName}`,
        tagline: `Your trusted partner`,
        aboutUs: `${companyName} is a leading provider in our industry.`,
        contactBlurb: `Contact us today to learn more about our services.`
      };
      
      if (contentJsonMatch) {
        try {
          websiteContent = JSON.parse(contentJsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse content JSON from Gemini response:', e);
        }
      }

      // Generate services separately
      const servicesResult = await model.generateContent(servicesPrompt);
      const servicesResponse = await servicesResult.response;
      const servicesText = servicesResponse.text();
      
      // Extract services JSON from the response
      const servicesJsonMatch = servicesText.match(/\[[\s\S]*\]/);
      let services = [
        { title: 'Service 1', description: 'Description of service 1' },
        { title: 'Service 2', description: 'Description of service 2' },
        { title: 'Service 3', description: 'Description of service 3' }
      ];
      
      if (servicesJsonMatch) {
        try {
          services = JSON.parse(servicesJsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse services JSON from Gemini response:', e);
        }
      }

      // Create tenant and page content in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the tenant
        const tenant = await tx.tenant.create({
          data: {
            slug,
            companyName,
            template,
            logoUrl: uploadedLogoUrl,
            favicon: uploadedFaviconUrl || null,
            industry: industry || null,
            settings: {},
            themeColors: themeColors || undefined,
            contactInfo: contactEmail || contactPhone || contactAddress ? {
              email: contactEmail || '',
              phone: contactPhone || '',
              address: contactAddress || ''
            } : undefined,
          },
        });

        // Create SEO data if provided
        if (seoTitle || seoDescription || seoKeywords) {
          await tx.sEO.create({
            data: {
              tenantId: tenant.id,
              title: seoTitle || companyName,
              description: seoDescription || '',
              keywords: seoKeywords || '',
              ogImage: uploadedWebsiteImageUrl || null,
            }
          });
        }

        // Create page content
        const pageContent = await tx.pageContent.create({
          data: {
            tenantId: tenant.id,
            homeTitle: websiteContent.homeTitle,
            tagline: websiteContent.tagline,
            aboutUs: websiteContent.aboutUs,
            services: JSON.stringify(services) as any, // Convert to JSON string for Prisma
            contactBlurb: websiteContent.contactBlurb,
            websiteImageUrl: uploadedWebsiteImageUrl || null,
          },
        });

        return { tenant, pageContent };
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error('Error creating content:', error);
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}

interface Service {
  title: string;
  description: string;
} 