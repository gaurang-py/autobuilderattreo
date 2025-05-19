export type SiteFormData = {
  slug: string;
  companyName: string;
  industry?: string;
  template: string;
  logo: FileList;
  favicon: FileList;
  websiteImage: FileList;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
};

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  industry?: string;
  template: string;
  logoUrl: string;
  createdAt: string;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface Enquiry {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
} 