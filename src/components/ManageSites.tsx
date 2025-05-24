import React, { useState } from 'react';
import Image from 'next/image';
import { Tenant } from '@/types';

interface ManageSitesProps {
  tenants: Tenant[];
  isLoading: boolean;
  onDeleteTenant: (slug: string) => void;
}

export default function ManageSites({ tenants, isLoading, onDeleteTenant }: ManageSitesProps) {
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const handleDelete = (slug: string) => {
    setDeletingSlug(slug);
    onDeleteTenant(slug);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Manage Websites
        </h2>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <span className="mt-4 text-gray-600 font-medium">Loading websites...</span>
            </div>
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No websites yet</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by creating your first website.</p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Website</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Template</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        {tenant.logoUrl && (
                          <div className="h-12 w-12 flex-shrink-0 mr-4 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                            <img 
                              src={tenant.logoUrl.startsWith('/uploads') 
                                ? tenant.logoUrl 
                                : tenant.logoUrl
                              } 
                              alt={tenant.companyName}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{tenant.companyName}</div>
                          <div className="text-blue-600 hover:text-blue-800 transition-colors duration-150">
                            <a 
                              href={`https://${tenant.slug}.servicecenterkolkata24x7.com`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              {tenant.slug}.servicecenterkolkata24x7.com
                              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tenant.template}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-4">
                        <a 
                          href={`https://${tenant.slug}.servicecenterkolkata24x7.com`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 flex items-center transition-colors duration-150"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </a>
                        <button
                          onClick={() => handleDelete(tenant.slug)}
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-all duration-150 ${
                            deletingSlug === tenant.slug || isLoading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer'
                          }`}
                          type="button"
                          disabled={deletingSlug === tenant.slug || isLoading}
                        >
                          {deletingSlug === tenant.slug ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </span>
                          ) : (
                            <>
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 