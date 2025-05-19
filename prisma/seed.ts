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
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 