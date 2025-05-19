import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

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

export default async function SitePage({ params }: PageParams) {
  const { slug } = params;
  
  console.log(`Rendering site page for slug: ${slug}`);

  try {
    // Fetch tenant data from the database
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        pages: true,
      },
    });

    if (!tenant) {
      console.log(`Tenant not found for slug: ${slug}`);
      return notFound();
    }

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
        />
      </div>
    );
  } catch (error) {
    console.error(`Error rendering site page for ${slug}:`, error);
    return <div>Error loading site: {String(error)}</div>;
  }
} 