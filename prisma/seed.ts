import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      // Hash the password
      const hashedPassword = await hash('admin', 10);

      // Create admin user
      const admin = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      });

      console.log(`Created admin user with ID: ${admin.id}`);
    } else {
      console.log('Admin user already exists');
    }

    // Create sample tenant
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: 'demo' },
    });

    if (!existingTenant) {
      const tenant = await prisma.tenant.create({
        data: {
          slug: 'demo',
          companyName: 'Demo Company',
          industry: 'Technology',
          template: 'professional',
          logoUrl: 'https://via.placeholder.com/150',
          settings: {},
          pages: {
            create: {
              homeTitle: 'Welcome to Demo Company',
              tagline: 'Your Trusted Technology Partner',
              aboutUs: 'We are a leading technology company dedicated to providing innovative solutions.',
              services: JSON.stringify([
                {
                  title: 'Web Development',
                  description: 'Custom web applications and websites'
                },
                {
                  title: 'Mobile Apps',
                  description: 'iOS and Android development'
                }
              ]),
              contactBlurb: 'Get in touch with us for your technology needs'
            }
          }
        }
      });
      console.log(`Created demo tenant with ID: ${tenant.id}`);
    } else {
      console.log('Demo tenant already exists');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 