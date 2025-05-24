import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import TemplateSelector from './TemplateSelector';
import { SiteFormData } from '@/types';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

interface CreateSiteFormProps {
  onSubmit: (data: SiteFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export default function CreateSiteForm({ onSubmit, isSubmitting, error }: CreateSiteFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SiteFormData>();
  
  const companyName = watch('companyName');
  const industry = watch('industry');
  const logo = watch('logo');
  const contactEmail = watch('contactEmail');

  // Add effect to fetch last tenant's contact info when form loads
  useEffect(() => {
    const fetchLastTenantContactInfo = async () => {
      try {
        const response = await fetch('/api/admin/tenants');
        if (response.ok) {
          const tenants = await response.json();
          console.log('Tenants:', tenants);
          if (tenants && tenants.length > 0) {
            const lastTenant = tenants[0]; // Tenants are ordered by createdAt desc
            if (lastTenant.contactInfo) {
              const contactInfo = lastTenant.contactInfo as ContactInfo;
              console.log('Last tenant contact info:', contactInfo);
              if (contactInfo.email) setValue('contactEmail', contactInfo.email);
              if (contactInfo.phone) setValue('contactPhone', contactInfo.phone);
              if (contactInfo.address) setValue('contactAddress', contactInfo.address);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching last tenant contact info:', error);
      }
    };

    fetchLastTenantContactInfo();
  }, [setValue]);

  // Add effect to watch contact email changes
  useEffect(() => {
    const fetchPreviousContactInfo = async () => {
      if (contactEmail) {
        try {
          const response = await fetch(`/api/contact-info?email=${encodeURIComponent(contactEmail)}`);
          if (response.ok) {
            const { data } = await response.json();
            if (data) {
              // Prefill contact information if found
              setValue('contactPhone', data.phone || '');
              // Don't set name as it's for the company, not the contact person
            }
          }
        } catch (error) {
          console.error('Error fetching contact info:', error);
        }
      }
    };

    fetchPreviousContactInfo();
  }, [contactEmail, setValue]);

  const onTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setValue('template', templateId);
  };

  const handleGenerateSeo = async () => {
    if (!companyName) {
      alert('Please enter a company name first');
      return;
    }

    try {
      setIsGeneratingSeo(true);
      const response = await fetch('/api/admin/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          industry,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO content');
      }

      const data = await response.json();
      setValue('seoTitle', data.seoTitle);
      setValue('seoDescription', data.seoDescription);
      setValue('seoKeywords', data.seoKeywords);
    } catch (err) {
      console.error('Error generating SEO:', err);
      alert('Failed to generate SEO content. Please try again.');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Also set the favicon to the same file
    if (event.target.files) {
      setValue('favicon', event.target.files);
    }
    
    try {
      setIsAnalyzingLogo(true);
      
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/admin/analyze-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze logo');
      }

      const data = await response.json();
      
      // If company name is not filled, use the one extracted from logo
      if (!companyName && data.companyName) {
        setValue('companyName', data.companyName);
      }
      
      // If industry is not filled, use the one extracted from logo
      if (!industry && data.industry) {
        setValue('industry', data.industry);
      }
      
      // Store theme colors from logo analysis
      if (data.colors) {
        setValue('themeColors', data.colors);
      }
      
      // Generate SEO content based on the extracted information
      if (data.companyName || data.industry) {
        const seoResponse = await fetch('/api/admin/generate-seo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: data.companyName || companyName,
            industry: data.industry || industry,
            colors: data.colors,
          }),
        });

        if (seoResponse.ok) {
          const seoData = await seoResponse.json();
          setValue('seoTitle', seoData.seoTitle);
          setValue('seoDescription', seoData.seoDescription);
          setValue('seoKeywords', seoData.seoKeywords);
        }
      }
      
    } catch (err) {
      console.error('Error analyzing logo:', err);
      alert('Failed to analyze logo. Please enter information manually.');
    } finally {
      setIsAnalyzingLogo(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Website
        </h2>
      </div>
      
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 flex items-center">
              Subdomain <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
              <input
                type="text"
                id="slug"
                {...register('slug', { 
                  required: 'Subdomain is required',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
                  }
                })}
                className="flex-1 min-w-0 block w-full rounded-l-md border-0 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                placeholder="your-company"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border-0 bg-gray-50 text-gray-500 sm:text-sm">
                .servicecenterkolkata24x7.com
              </span>
            </div>
            {errors.slug && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 flex items-center">
              Company Name <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
              <input
                type="text"
                id="companyName"
                {...register('companyName', { required: 'Company name is required' })}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                placeholder="Your Company Name"
              />
            </div>
            {errors.companyName && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.companyName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 flex items-center">
            Industry <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              type="text"
              id="industry"
              {...register('industry', { required: 'Industry is required' })}
              placeholder="e.g. Technology, Healthcare, Education, etc."
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
            />
          </div>
          {errors.industry && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.industry.message}
            </p>
          )}
          <p className="text-xs text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Helps with AI-generated SEO content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 flex items-center">
              Company Logo <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="logo" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      {...register('logo', { required: 'Logo is required' })}
                      onChange={handleLogoUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {isAnalyzingLogo && (
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing logo with AI...
              </div>
            )}
            {errors.logo && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.logo.message}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommended: 200x50px. We'll analyze your logo to extract information.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="favicon" className="block text-sm font-medium text-gray-700 flex items-center">
              Favicon <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="favicon" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      id="favicon"
                      accept="image/*"
                      {...register('favicon', { required: 'Favicon is required' })}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, ICO up to 2MB</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommended: 32x32px (uses logo by default)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="websiteImage" className="block text-sm font-medium text-gray-700 flex items-center">
              Hero Image <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="websiteImage" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      id="websiteImage"
                      accept="image/*"
                      {...register('websiteImage', { required: 'Hero image is required' })}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommended: 1200x600px
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              SEO Settings
            </h3>
            <button
              type="button"
              onClick={handleGenerateSeo}
              disabled={isGeneratingSeo || !companyName}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              {isGeneratingSeo ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate with AI
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 flex items-center">
                SEO Title <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
                <input
                  type="text"
                  id="seoTitle"
                  {...register('seoTitle', { required: 'SEO title is required' })}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                  placeholder="Enter SEO title"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 flex items-center">
                SEO Keywords <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
                <input
                  type="text"
                  id="seoKeywords"
                  {...register('seoKeywords', { required: 'SEO keywords are required' })}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                  placeholder="Enter keywords separated by commas"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-6">
            <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 flex items-center">
              SEO Description <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
              <textarea
                id="seoDescription"
                rows={2}
                {...register('seoDescription', { required: 'SEO description is required' })}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white resize-none"
                placeholder="Enter SEO description"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">This information will be displayed on the website's contact page</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 flex items-center">
              Contact Email <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                id="contactEmail"
                {...register('contactEmail', { required: 'Contact email is required' })}
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 flex items-center">
              Contact Phone <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                id="contactPhone"
                {...register('contactPhone', { required: 'Contact phone is required' })}
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 flex items-center">
            Business Address <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <textarea
              id="contactAddress"
              rows={2}
              {...register('contactAddress', { required: 'Business address is required' })}
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-white resize-none"
              placeholder="Enter your business address"
            ></textarea>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Website Template
          </h3>
          <p className="mt-1 text-sm text-gray-500">Choose a template for your website</p>
        </div>

        <TemplateSelector
          onSelectTemplate={onTemplateSelect}
          selectedTemplate={selectedTemplate}
        />
        
        <input type="hidden" {...register('template')} />

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Website
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 
