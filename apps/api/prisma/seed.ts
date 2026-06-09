import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sleekndchic.com' },
    update: {},
    create: {
      email: 'admin@sleekndchic.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@sleekndchic.com' },
    update: {},
    create: {
      email: 'staff@sleekndchic.com',
      passwordHash: staffPassword,
      fullName: 'Staff User',
      role: 'STAFF',
    },
  });
  console.log('✅ Created staff user:', staff.email);

  // Create categories
  const categories = [
    { name: 'Dresses', slug: 'dresses' },
    { name: 'Tops', slug: 'tops' },
    { name: 'Bottoms', slug: 'bottoms' },
    { name: 'Outerwear', slug: 'outerwear' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Created categories');

  // Create shipping states
  const shippingStates = [
    { stateName: 'California', shippingMethod: 'AUTHORIZED_CAR_PARK', price: 15 },
    { stateName: 'California', shippingMethod: 'DELIVERY_COMPANY', price: 25 },
    { stateName: 'New York', shippingMethod: 'AUTHORIZED_CAR_PARK', price: 12 },
    { stateName: 'New York', shippingMethod: 'DELIVERY_COMPANY', price: 22 },
    { stateName: 'Texas', shippingMethod: 'AUTHORIZED_CAR_PARK', price: 14 },
    { stateName: 'Texas', shippingMethod: 'DELIVERY_COMPANY', price: 24 },
  ];

  for (const state of shippingStates) {
    await prisma.stateShipping.upsert({
      where: {
        stateName_shippingMethod: {
          stateName: state.stateName,
          shippingMethod: state.shippingMethod,
        },
      },
      update: {},
      create: state,
    });
  }
  console.log('✅ Created shipping states');

  // Create sample products
  const category = await prisma.category.findFirst({ where: { slug: 'dresses' } });
  
  if (category) {
    const product = await prisma.product.upsert({
      where: { sku: 'DRS-001' },
      update: {},
      create: {
        name: 'Elegant Evening Dress',
        description: 'A beautiful evening dress perfect for special occasions.',
        basePrice: 129.99,
        sku: 'DRS-001',
        categoryId: category.id,
        lowStockThreshold: 5,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', altText: 'Front view', displayOrder: 0 },
            { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', altText: 'Back view', displayOrder: 1 },
          ],
        },
        variants: {
          create: [
            { size: 'S', color: 'Black', skuSuffix: 'S-BLK', stockQuantity: 10 },
            { size: 'M', color: 'Black', skuSuffix: 'M-BLK', stockQuantity: 15 },
            { size: 'L', color: 'Black', skuSuffix: 'L-BLK', stockQuantity: 8 },
            { size: 'S', color: 'Navy', skuSuffix: 'S-NVY', stockQuantity: 12 },
            { size: 'M', color: 'Navy', skuSuffix: 'M-NVY', stockQuantity: 10 },
          ],
        },
      },
    });
    console.log('✅ Created sample product:', product.name);
  }

  // Create sample coupon
  const coupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 50,
      usageLimit: 100,
      active: true,
    },
  });
  console.log('✅ Created sample coupon:', coupon.code);

  // Create carousel items
  const carouselItems = [
    { imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600', altText: 'New Collection', targetUrl: '/shop', displayOrder: 0 },
    { imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600', altText: 'Summer Sale', targetUrl: '/shop', displayOrder: 1 },
  ];

  for (const item of carouselItems) {
    await prisma.carouselItem.create({ data: item });
  }
  console.log('✅ Created carousel items');

  // Create sample blog post
  const blogPost = await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-sleekndchic' },
    update: {},
    create: {
      title: 'Welcome to SleekNDChic',
      slug: 'welcome-to-sleekndchic',
      contentHtml: '<p>Welcome to our brand new online store! We are excited to share our curated collection with you.</p>',
      excerpt: 'Discover our new online store and curated collection.',
      publishedAt: new Date(),
      active: true,
    },
  });
  console.log('✅ Created blog post:', blogPost.title);

  // Create sample page
  const page = await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about',
      contentHtml: '<p>SleekNDChic is a premium fashion brand dedicated to providing timeless elegance and modern style.</p>',
      active: true,
    },
  });
  console.log('✅ Created page:', page.title);

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
