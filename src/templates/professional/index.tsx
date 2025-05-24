'use client';

import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import Head from 'next/head';

interface Service {
  title: string;
  description: string;
}

interface ProfessionalTemplateProps {
  companyName: string;
  homeTitle: string;
  tagline: string;
  aboutUs: string;
  services: Service[];
  contactBlurb: string;
  logoUrl: string;
  websiteImageUrl?: string;
  tenantSlug: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export default function ProfessionalTemplate({
  companyName,
  homeTitle,
  tagline,
  aboutUs,
  services,
  contactBlurb,
  logoUrl,
  websiteImageUrl,
  tenantSlug,
  primaryColor = '#0f172a',
  secondaryColor = '#1e40af',
  accentColor = '#3b82f6',
  textColor = '#333333',
  backgroundColor = '#ffffff',
  contactEmail = '',
  contactPhone = '',
  contactAddress = '',
  metaDescription = '',
  metaKeywords = '',
}: ProfessionalTemplateProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: '',
  });

  // Default meta description if not provided
  const seoDescription = metaDescription || `${companyName} - ${tagline}`;
  // Default meta keywords if not provided
  const seoKeywords = metaKeywords || `${companyName}, ${services.map(s => s.title).join(', ')}`;
  
  // Format phone number for href
  const formattedPhone = contactPhone ? contactPhone.replace(/[^\d+]/g, '') : '';

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If email field changes, try to fetch previous contact info
    if (name === 'email' && value) {
      try {
        const response = await fetch(`/api/contact-info?email=${encodeURIComponent(value)}`);
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            setFormData(prev => ({
              ...prev,
              name: data.name || prev.name,
              phone: data.phone || prev.phone,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.message || !tenantSlug) {
      setFormStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Please fill in all required fields (Name, Email, and Message)',
      });
      return;
    }

    setFormStatus({ isSubmitting: true, isSubmitted: false, error: '' });

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenantSlug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit enquiry');
      }

      setFormStatus({
        isSubmitting: false,
        isSubmitted: true,
        error: '',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      setFormStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  // Create CSS variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
    '--accent-color': accentColor,
    '--text-color': textColor,
    '--background-color': backgroundColor,
  } as React.CSSProperties;

  // Add global CSS for theme colors
  const globalCss = `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --accent-color: ${accentColor};
      --text-color: ${textColor};
      --background-color: ${backgroundColor};
    }
    
    .text-primary-color {
      color: var(--primary-color);
    }
    
    .text-secondary-color {
      color: var(--secondary-color);
    }
    
    .text-accent-color {
      color: var(--accent-color);
    }
    
    .bg-primary-color {
      background-color: var(--primary-color);
    }
    
    .bg-secondary-color {
      background-color: var(--secondary-color);
    }
    
    .bg-accent-color {
      background-color: var(--accent-color);
    }
    
    .hover\\:text-accent-color:hover {
      color: var(--accent-color);
    }
    
    .hover\\:bg-accent-color:hover {
      background-color: var(--accent-color);
    }
    
    .focus\\:border-accent-color:focus {
      border-color: var(--accent-color);
    }
    
    .focus\\:ring-accent-color:focus {
      --tw-ring-color: var(--accent-color);
    }
    
    .floating-call-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--accent-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .floating-call-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50" style={themeStyles}>
      <Head>
        <title>{companyName} - {tagline}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={`${companyName} - ${tagline}`} />
        <meta property="og:description" content={seoDescription} />
        {websiteImageUrl && <meta property="og:image" content={websiteImageUrl} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${companyName} - ${tagline}`} />
        <meta name="twitter:description" content={seoDescription} />
        {websiteImageUrl && <meta name="twitter:image" content={websiteImageUrl} />}
      </Head>
      
      <style jsx global>{globalCss}</style>
      
      {/* Floating Call Button */}
      {contactPhone && (
        <a 
          href={`tel:${formattedPhone}`}
          className="floating-call-button"
          aria-label="Call us"
          title={`Call ${companyName}: ${contactPhone}`}
        >
          <FaPhone size={24} />
        </a>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={logoUrl} alt={companyName} className="h-12 w-auto mr-4" />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{companyName}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="hover:text-accent-color font-medium" style={{ color: 'var(--text-color)' }}>Home</a>
              <a href="#about" className="hover:text-accent-color font-medium" style={{ color: 'var(--text-color)' }}>About</a>
              <a href="#services" className="hover:text-accent-color font-medium" style={{ color: 'var(--text-color)' }}>Services</a>
              <a href="#contact" className="hover:text-accent-color font-medium" style={{ color: 'var(--text-color)' }}>Contact</a>
            </nav>
            <div className="md:hidden">
              {/* Mobile menu button would go here */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 bg-gradient-to-r text-white" style={{ backgroundImage: `linear-gradient(to right, var(--primary-color), var(--secondary-color))` }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{homeTitle}</h2>
              <p className="text-xl mb-8">{tagline}</p>
              <a 
                href="#contact" 
                className="bg-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                style={{ color: 'var(--primary-color)' }}
              >
                Get in Touch
              </a>
            </div>
            <div className="md:w-1/2">
              {websiteImageUrl ? (
                <img 
                  src={websiteImageUrl} 
                  alt={companyName} 
                  className="rounded-lg shadow-2xl w-full h-auto"
                />
              ) : (
                <div className="bg-gray-300 rounded-lg h-80 w-full flex items-center justify-center">
                  <span className="text-gray-600">Image Placeholder</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20" style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: 'var(--primary-color)' }}>About Us</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-color)' }}>
              {aboutUs}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: 'var(--primary-color)' }}>Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition duration-300"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--accent-color)' }}>
                  <FaCheck className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>{service.title}</h3>
                <p style={{ color: 'var(--text-color)' }}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: 'var(--primary-color)' }}>Contact Us</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-lg mb-8" style={{ color: 'var(--text-color)' }}>{contactBlurb}</p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--accent-color)' }}>
                    <FaPhone className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--primary-color)' }}>Phone</h4>
                    <p style={{ color: 'var(--text-color)' }}>{contactPhone || '+1 (555) 123-4567'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--accent-color)' }}>
                    <FaEnvelope className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--primary-color)' }}>Email</h4>
                    <p style={{ color: 'var(--text-color)' }}>{contactEmail || `info@${tenantSlug}.com`}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--accent-color)' }}>
                    <FaMapMarkerAlt className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--primary-color)' }}>Address</h4>
                    <p className="whitespace-pre-line" style={{ color: 'var(--text-color)' }}>{contactAddress || '123 Business St, Suite 100\nCity, State 12345'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>Send us a Message</h3>
              
              {formStatus.isSubmitted ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <p>Thank you for your message! We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {formStatus.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      <p>{formStatus.error}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      style={{ borderColor: 'var(--accent-color)' }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      style={{ borderColor: 'var(--accent-color)' }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      style={{ borderColor: 'var(--accent-color)' }}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      style={{ borderColor: 'var(--accent-color)' }}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formStatus.isSubmitting}
                    className="w-full py-2 px-4 rounded-md font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  >
                    {formStatus.isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-color text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <img src={logoUrl} alt={companyName} className="h-10 w-auto mb-4" />
              <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <a href="#home" className="hover:text-gray-300">Home</a>
              <a href="#about" className="hover:text-gray-300">About</a>
              <a href="#services" className="hover:text-gray-300">Services</a>
              <a href="#contact" className="hover:text-gray-300">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}