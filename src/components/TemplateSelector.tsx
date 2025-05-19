import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  features: string[];
  primaryColor: string;
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSelector({ 
  selectedTemplate, 
  onSelectTemplate 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/admin/templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading templates...</div>;
  }

  if (templates.length === 0) {
    return <div className="p-4 text-center">No templates available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div 
          key={template.id}
          onClick={() => onSelectTemplate(template.id)}
          className={`
            border rounded-lg overflow-hidden cursor-pointer transition-shadow
            ${selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
          `}
        >
          <div className="relative h-48 w-full bg-gray-100">
            {template.thumbnail ? (
              <Image
                src={template.thumbnail}
                alt={template.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: template.primaryColor || '#f3f4f6' }}
              >
                <span className="text-white text-xl font-bold">{template.name}</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{template.description}</p>
            
            {template.features && template.features.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                <ul className="mt-1 text-xs text-gray-500 space-y-1">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 