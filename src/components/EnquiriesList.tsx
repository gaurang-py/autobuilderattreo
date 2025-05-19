import React, { useState, useEffect } from 'react';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

interface Tenant {
  id: string;
  slug: string;
  companyName: string;
}

interface EnquiriesListProps {
  tenants: Tenant[];
}

export default function EnquiriesList({ tenants }: EnquiriesListProps) {
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (selectedTenant) {
      fetchEnquiries();
    }
  }, [selectedTenant, statusFilter]);

  const fetchEnquiries = async () => {
    if (!selectedTenant) return;
    
    setLoading(true);
    try {
      const url = new URL('/api/admin/enquiries', window.location.origin);
      url.searchParams.append('tenantSlug', selectedTenant);
      
      if (statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch enquiries');
      }
      
      const data = await response.json();
      setEnquiries(data.enquiries);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateEnquiryStatus = async (enquiryId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enquiryId,
          status,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update enquiry status');
      }
      
      // Update local state
      setEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === enquiryId ? { ...enquiry, status } : enquiry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Manage Enquiries
        </h2>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label htmlFor="tenantSelect" className="block text-sm font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Select Website
            </label>
            <div className="relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
              <select
                id="tenantSelect"
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
              >
                <option value="">Select a website</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.slug}>
                    {tenant.companyName} ({tenant.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedTenant && (
            <div className="space-y-2">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by Status
              </label>
              <div className="relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                >
                  <option value="all">All Enquiries</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <span className="mt-4 text-gray-600 font-medium">Loading enquiries...</span>
            </div>
          </div>
        ) : selectedTenant && enquiries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No enquiries found</h3>
            <p className="mt-2 text-sm text-gray-500">There are no enquiries for this website yet.</p>
          </div>
        ) : selectedTenant ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Message</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                      {formatDate(enquiry.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-gray-900">
                      {enquiry.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      <a href={`mailto:${enquiry.email}`} className="text-blue-600 hover:text-blue-800 transition-colors duration-150 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {enquiry.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {enquiry.phone ? (
                        <a href={`tel:${enquiry.phone}`} className="text-blue-600 hover:text-blue-800 transition-colors duration-150 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {enquiry.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Not provided
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-5 text-sm text-gray-500 max-w-xs truncate">
                      {enquiry.message}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        enquiry.status === 'new' ? 'bg-green-100 text-green-800' : 
                        enquiry.status === 'read' ? 'bg-blue-100 text-blue-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                      <div className="relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset transition-all duration-200">
                        <select
                          value={enquiry.status}
                          onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value)}
                          className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 bg-white"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Website</h3>
            <p className="mt-2 text-sm text-gray-500">Please select a website to view its enquiries.</p>
          </div>
        )}
      </div>
    </div>
  );
} 