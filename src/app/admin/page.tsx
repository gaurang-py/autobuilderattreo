'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import AdminTabs from '@/components/AdminTabs';
import CreateSiteForm from '@/components/CreateSiteForm';
import ManageSites from '@/components/ManageSites';
import EnquiriesList from '@/components/EnquiriesList';
import { SiteFormData, Tenant } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'enquiries'>('create');

  // Handle tab change and reset loading state
  const handleTabChange = (tab: 'create' | 'manage' | 'enquiries') => {
    setActiveTab(tab);
    setIsLoading(false); // Reset loading state when changing tabs
  };

  useEffect(() => {
    // Verify authentication on component mount
    async function verifyAuth() {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include', // Important: include cookies in the request
        });
        
        if (!response.ok) {
          // If not authenticated, redirect to login
          router.push('/admin/login');
          return;
        }
        
        const data = await response.json();
        if (!data.authenticated) {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        router.push('/admin/login');
      }
    }
    
    verifyAuth();
  }, [router]);

  // Load existing tenants
  useEffect(() => {
    async function fetchTenants() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/tenants', {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (response.ok) {
          const data = await response.json();
          setTenants(data);
        } else {
          console.error('Failed to fetch tenants:', response.status);
        }
      } catch (err) {
        console.error('Failed to fetch tenants:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTenants();
  }, []);

  const onSubmit = async (data: SiteFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('slug', data.slug);
      formData.append('companyName', data.companyName);
      formData.append('template', data.template);
      
      // Add industry if provided
      if (data.industry) {
        formData.append('industry', data.industry);
      }
      
      // Add contact information if provided
      if (data.contactEmail) {
        formData.append('contactEmail', data.contactEmail);
      }
      if (data.contactPhone) {
        formData.append('contactPhone', data.contactPhone);
      }
      if (data.contactAddress) {
        formData.append('contactAddress', data.contactAddress);
      }
      
      // Add theme colors if provided
      if (data.themeColors) {
        formData.append('themeColors', JSON.stringify(data.themeColors));
      }
      
      // Upload logo to ImgBB
      if (data.logo && data.logo.length > 0) {
        const logoFormData = new FormData();
        logoFormData.append('image', data.logo[0]);
        
        const logoResponse = await fetch('/api/admin/image-upload', {
          method: 'POST',
          body: logoFormData,
        });
        
        if (!logoResponse.ok) {
          const errorData = await logoResponse.json();
          throw new Error(errorData.error || 'Failed to upload logo');
        }
        
        const logoResult = await logoResponse.json();
        formData.append('logoUrl', logoResult.data.url);
      }

      // Upload favicon to ImgBB if provided
      if (data.favicon && data.favicon.length > 0) {
        const faviconFormData = new FormData();
        faviconFormData.append('image', data.favicon[0]);
        
        const faviconResponse = await fetch('/api/admin/image-upload', {
          method: 'POST',
          body: faviconFormData,
        });
        
        if (!faviconResponse.ok) {
          const errorData = await faviconResponse.json();
          throw new Error(errorData.error || 'Failed to upload favicon');
        }
        
        const faviconResult = await faviconResponse.json();
        formData.append('faviconUrl', faviconResult.data.url);
      }
      
      // Upload website image to ImgBB if provided
      if (data.websiteImage && data.websiteImage.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append('image', data.websiteImage[0]);
        
        const imgbbResponse = await fetch('/api/admin/image-upload', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!imgbbResponse.ok) {
          const errorData = await imgbbResponse.json();
          throw new Error(errorData.error || 'Failed to upload website image');
        }
        
        const imgbbResult = await imgbbResponse.json();
        formData.append('websiteImageUrl', imgbbResult.data.url);
      }

      // Add SEO data
      formData.append('seoTitle', data.seoTitle || data.companyName);
      formData.append('seoDescription', data.seoDescription || '');
      formData.append('seoKeywords', data.seoKeywords || '');

      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tenant');
      }

      const result = await response.json();
      router.push(`https://${data.slug}.servicecenterkolkata24x7.com`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete the website for ${slug}?`)) {
      return;
    }
    
    try {
      console.log(`Deleting tenant with slug: ${slug}`);
      setIsLoading(true); // Show loading state
      
      const apiUrl = `/api/admin/tenants/delete`;
      console.log(`Calling API: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
      });
      
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tenant');
      }
      
      // Refresh tenant list after successful deletion
      const updatedTenants = tenants.filter(tenant => tenant.slug !== slug);
      console.log(`Filtered tenants from ${tenants.length} to ${updatedTenants.length}`);
      setTenants(updatedTenants);
      
      alert(`Website ${slug} has been deleted successfully.`);
    } catch (err) {
      console.error('Delete tenant error:', err);
      alert(`Error deleting tenant: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // Add this function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        credentials: 'include',
      });
      
      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = '/admin/login';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="p-6">
            {activeTab === 'create' ? (
              <div className="transition-all duration-300 ease-in-out">
                <CreateSiteForm 
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  error={error}
                />
              </div>
            ) : activeTab === 'manage' ? (
              <div className="transition-all duration-300 ease-in-out">
                <ManageSites 
                  tenants={tenants}
                  isLoading={isLoading}
                  onDeleteTenant={handleDeleteTenant}
                />
              </div>
            ) : (
              <div className="transition-all duration-300 ease-in-out">
                <EnquiriesList tenants={tenants} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 