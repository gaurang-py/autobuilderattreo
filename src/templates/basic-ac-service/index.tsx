import Image from 'next/image';

interface Service {
  title: string;
  description: string;
}

interface BasicACTemplateProps {
  companyName: string;
  homeTitle: string;
  tagline: string;
  aboutUs: string;
  services: Service[];
  contactBlurb: string;
  logoUrl: string;
  websiteImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}

export default function BasicACTemplate({
  companyName,
  homeTitle,
  tagline,
  aboutUs,
  services,
  contactBlurb,
  logoUrl,
  websiteImageUrl,
  contactEmail,
  contactPhone,
  contactAddress,
}: BasicACTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src={logoUrl}
              alt={`${companyName} Logo`}
              width={50}
              height={50}
              className="rounded-md"
            />
            <h1 className="text-xl font-bold">{companyName}</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#about" className="hover:underline">About</a></li>
              <li><a href="#services" className="hover:underline">Services</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{homeTitle}</h2>
          <p className="text-xl max-w-2xl mx-auto">{tagline}</p>
          <button className="mt-8 bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition">
            Get a Free Quote
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">About Us</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-black leading-relaxed">{aboutUs}</p>
          </div>
          
          {websiteImageUrl && (
            <div className="mt-8 max-w-2xl mx-auto">
              <Image
                src={websiteImageUrl}
                alt={`${companyName}`}
                width={800}
                height={400}
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-blue-600">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{service.title}</h3>
                <p className="text-black">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">Contact Us</h2>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <p className="text-black mb-6">{contactBlurb}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">Contact Information</h3>
                <div className="space-y-4">
                  {contactEmail && (
                    <div>
                      <p className="font-medium text-gray-700">Email:</p>
                      <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">{contactEmail}</a>
                    </div>
                  )}
                  {contactPhone && (
                    <div>
                      <p className="font-medium text-gray-700">Phone:</p>
                      <a href={`tel:${contactPhone}`} className="text-blue-600 hover:underline">{contactPhone}</a>
                    </div>
                  )}
                  {contactAddress && (
                    <div>
                      <p className="font-medium text-gray-700">Address:</p>
                      <p className="whitespace-pre-line">{contactAddress}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-black mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-black mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-black mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-black mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-200">Privacy Policy</a>
              <a href="#" className="hover:text-blue-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 