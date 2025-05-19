import BasicACTemplate from '../templates/basic-ac-service';

export default function Home() {
  // Sample data for the template
  const templateData = {
    companyName: "Cool Air AC Services",
    homeTitle: "Professional AC Installation & Repair",
    tagline: "Keeping your home comfortable all year round with reliable, affordable AC services",
    aboutUs: "With over 15 years of experience, Cool Air AC Services is dedicated to providing top-quality air conditioning solutions for residential and commercial clients. Our certified technicians are committed to excellence, ensuring your comfort and satisfaction with every service call.",
    services: [
      {
        title: "AC Installation",
        description: "Professional installation of new air conditioning systems with expert advice on the best solutions for your space."
      },
      {
        title: "AC Repair & Maintenance",
        description: "Fast, reliable repairs and regular maintenance to keep your AC system running efficiently year-round."
      },
      {
        title: "Emergency Services",
        description: "24/7 emergency repair services when you need help the most, with quick response times."
      }
    ],
    contactBlurb: "Have questions or need to schedule a service? Reach out to our friendly team today for a free consultation.",
    logoUrl: "/next.svg" // Using existing Next.js logo as a placeholder
  };

  return <BasicACTemplate {...templateData} />;
}
