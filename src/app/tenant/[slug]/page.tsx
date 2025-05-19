import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

// Import templates
import BasicACTemplate from '@/templates/basic-ac-service';
import ProfessionalTemplate from '@/templates/professional';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

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

// Generate metadata for the page
export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  
  // Fetch tenant data from the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${slug}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return {
      title: 'Not Found',
      description: 'The requested page was not found',
    };
  }

  const tenant = await response.json();
  
  // Get SEO data if available
  const seo = tenant.seo;
  
  return {
    title: seo?.title || tenant.companyName,
    description: seo?.description || `Welcome to ${tenant.companyName}`,
    keywords: seo?.keywords || '',
    openGraph: {
      title: seo?.title || tenant.companyName,
      description: seo?.description || `Welcome to ${tenant.companyName}`,
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
    icons: {
      icon: tenant.favicon || '/favicon.ico',
    },
  };
}

// Disable caching to ensure new data is fetched each time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TenantPage({ params }: PageParams) {
  const { slug } = params;
  
  console.log(`Rendering tenant page for slug: ${slug}`);

  try {
    // Fetch tenant data from the API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log(`Tenant not found for slug: ${slug}`);
      return notFound();
    }

    const tenant = await response.json();
    console.log(`Tenant data:`, JSON.stringify(tenant, null, 2));

    // Get the correct template component
    const TemplateComponent = templates[tenant.template];
    
    if (!TemplateComponent) {
      console.log(`Template not found: ${tenant.template}`);
      return <div>Template not found: {tenant.template}</div>;
    }

    // Get the first page content
    const pageContent = tenant.pages[0];
    
    if (!pageContent) {
      console.log(`Page content not found for tenant: ${tenant.id}`);
      return <div>Page content not found</div>;
    }

    console.log(`Rendering template with data:`, {
      companyName: tenant.companyName,
      template: tenant.template,
      slug: tenant.slug
    });

    // Get theme colors from tenant data
    const themeColors = tenant.themeColors as any || {};
    const contactInfo = tenant.contactInfo as any || {};

    const props = {
      companyName: tenant.companyName,
      homeTitle: pageContent.homeTitle,
      tagline: pageContent.tagline,
      aboutUs: pageContent.aboutUs,
      services: pageContent.services,
      contactBlurb: pageContent.contactBlurb,
      logoUrl: tenant.logoUrl,
      websiteImageUrl: pageContent.websiteImageUrl || undefined,
      seo: tenant.seo || undefined,
      contactEmail: (tenant.contactInfo as ContactInfo)?.email,
      contactPhone: (tenant.contactInfo as ContactInfo)?.phone,
      contactAddress: (tenant.contactInfo as ContactInfo)?.address,
      primaryColor: themeColors.primary || '#0f172a',
      secondaryColor: themeColors.secondary || '#1e40af',
      accentColor: themeColors.accent || '#3b82f6',
      textColor: themeColors.text || '#333333',
      backgroundColor: themeColors.background || '#ffffff',
    };

    // Render the template with the tenant data
    return (
      <div data-tenant-slug={slug} data-template={tenant.template}>
        <TemplateComponent {...props} />
      </div>
    );
  } catch (error) {
    console.error(`Error rendering tenant page for ${slug}:`, error);
    return <div>Error loading tenant: {String(error)}</div>;
  }
} 