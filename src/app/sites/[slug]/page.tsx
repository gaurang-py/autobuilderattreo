export const dynamic = 'force-dynamic'; // disables static rendering

import { notFound } from 'next/navigation';

// Import templates
import BasicACTemplate from '@/templates/basic-ac-service';
import ProfessionalTemplate from '@/templates/professional';

// Template mapping for easy lookup
const templates: Record<string, any> = {
  'basic-ac-service': BasicACTemplate,
  'professional': ProfessionalTemplate,
};

interface PageParams {
  params: {
    slug: string;
  };
}

async function fetchTenantData(slug: string) {
  try {
    // Use absolute URL with origin
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tenant/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 404) {
      console.log(`[SitePage] Tenant not found for slug: ${slug}`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[SitePage] Error fetching tenant data:', error);
    throw error;
  }
}

export default async function SitePage({ params }: PageParams) {
  // Ensure params is properly awaited
  const slug = params?.slug;
  
  if (!slug) {
    console.log('[SitePage] No slug provided');
    return notFound();
  }

  console.log(`[SitePage] Starting to render site page for slug: ${slug}`);

  try {
    // Fetch tenant data from the API
    console.log(`[SitePage] Attempting to fetch tenant data for slug: ${slug}`);
    const tenant = await fetchTenantData(slug);

    if (!tenant) {
      console.log(`[SitePage] Tenant not found for slug: ${slug}`);
      return notFound();
    }

    console.log(`[SitePage] Successfully found tenant:`, {
      id: tenant.id,
      companyName: tenant.companyName,
      template: tenant.template,
      pagesCount: tenant.pages.length
    });

    // Get the correct template component
    const TemplateComponent = templates[tenant.template];
    
    if (!TemplateComponent) {
      console.log(`[SitePage] Template not found: ${tenant.template}`);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Template Error</h1>
            <p className="text-gray-600">Template not found: {tenant.template}</p>
          </div>
        </div>
      );
    }

    // Get the first page content
    const pageContent = tenant.pages[0];
    
    if (!pageContent) {
      console.log(`[SitePage] Page content not found for tenant: ${tenant.id}`);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Content Error</h1>
            <p className="text-gray-600">Page content not found for this site.</p>
          </div>
        </div>
      );
    }

    console.log(`[SitePage] Rendering template with data:`, {
      companyName: tenant.companyName,
      template: tenant.template,
      slug: tenant.slug,
      hasLogo: !!tenant.logoUrl,
      hasWebsiteImage: !!pageContent.websiteImageUrl
    });

    // Render the template with the tenant data
    return (
      <div data-tenant-slug={slug} data-template={tenant.template}>
        <TemplateComponent
          companyName={tenant.companyName}
          homeTitle={pageContent.homeTitle}
          tagline={pageContent.tagline}
          aboutUs={pageContent.aboutUs}
          services={typeof pageContent.services === 'string' 
            ? JSON.parse(pageContent.services) 
            : pageContent.services}
          contactBlurb={pageContent.contactBlurb}
          logoUrl={tenant.logoUrl}
          websiteImageUrl={pageContent.websiteImageUrl || undefined}
          tenantSlug={slug}
          primaryColor={tenant.primaryColor || undefined}
          secondaryColor={tenant.secondaryColor || undefined}
          accentColor={tenant.accentColor || undefined}
          textColor={tenant.textColor || undefined}
          backgroundColor={tenant.backgroundColor || undefined}
          contactEmail={tenant.contactEmail || undefined}
          contactPhone={tenant.contactPhone || undefined}
          contactAddress={tenant.contactAddress || undefined}
          metaDescription={pageContent.metaDescription || undefined}
          metaKeywords={pageContent.metaKeywords || undefined}
        />
      </div>
    );
  } catch (error) {
    console.error(`[SitePage] Error rendering site page for ${slug}:`, error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`[SitePage] Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Site</h1>
          <p className="text-gray-600">There was an error loading this site. Please try again later.</p>
          <p className="text-sm text-gray-500 mt-2">Error: {String(error)}</p>
        </div>
      </div>
    );
  }
} 