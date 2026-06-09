/**
 * SQLite to PostgreSQL Migration Script
 * 
 * This script migrates data from SQLite to PostgreSQL.
 * Run this after setting up PostgreSQL database.
 * 
 * Steps:
 * 1. Set up PostgreSQL locally or via Docker
 * 2. Update .env with PostgreSQL DATABASE_URL
 * 3. Run: npx prisma migrate dev
 * 4. Run this script: npx ts-node scripts/migrate-to-postgres.ts
 */

import { PrismaClient as PrismaClientSQLite } from '@prisma/client';
import { PrismaClient as PrismaClientPostgres } from '@prisma/client';
import * as path from 'path';

// SQLite client (source)
const sqlitePrisma = new PrismaClientSQLite({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, '../prisma/dev.db')}`,
    },
  },
});

// PostgreSQL client (target)
const postgresPrisma = new PrismaClientPostgres();

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');

  try {
    // 1. Migrate Users
    console.log('👤 Migrating users...');
    const users = await sqlitePrisma.user.findMany();
    for (const user of users) {
      await postgresPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          fullName: user.fullName,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${users.length} users\n`);

    // 2. Migrate Categories
    console.log('📂 Migrating categories...');
    const categories = await sqlitePrisma.category.findMany();
    for (const category of categories) {
      await postgresPrisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          active: category.active,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${categories.length} categories\n`);

    // 3. Migrate Products
    console.log('👗 Migrating products...');
    const products = await sqlitePrisma.product.findMany();
    for (const product of products) {
      await postgresPrisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          basePrice: product.basePrice,
          sku: product.sku,
          categoryId: product.categoryId,
          lowStockThreshold: product.lowStockThreshold,
          active: product.active,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${products.length} products\n`);

    // 4. Migrate Product Images
    console.log('🖼️  Migrating product images...');
    const images = await sqlitePrisma.productImage.findMany();
    for (const image of images) {
      await postgresPrisma.productImage.create({
        data: {
          id: image.id,
          productId: image.productId,
          url: image.url,
          altText: image.altText,
          displayOrder: image.displayOrder,
        },
      });
    }
    console.log(`   ✓ Migrated ${images.length} product images\n`);

    // 5. Migrate Variants
    console.log('🎨 Migrating variants...');
    const variants = await sqlitePrisma.variant.findMany();
    for (const variant of variants) {
      await postgresPrisma.variant.create({
        data: {
          id: variant.id,
          productId: variant.productId,
          size: variant.size,
          color: variant.color,
          skuSuffix: variant.skuSuffix,
          stockQuantity: variant.stockQuantity,
          active: variant.active,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${variants.length} variants\n`);

    // 6. Migrate State Shipping
    console.log('🚚 Migrating state shipping rates...');
    const shipping = await sqlitePrisma.stateShipping.findMany();
    for (const rate of shipping) {
      await postgresPrisma.stateShipping.create({
        data: {
          id: rate.id,
          stateName: rate.stateName,
          shippingMethod: rate.shippingMethod,
          price: rate.price,
          active: rate.active,
        },
      });
    }
    console.log(`   ✓ Migrated ${shipping.length} shipping rates\n`);

    // 7. Migrate Coupons
    console.log('🎟️  Migrating coupons...');
    const coupons = await sqlitePrisma.coupon.findMany();
    for (const coupon of coupons) {
      await postgresPrisma.coupon.create({
        data: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minOrderAmount: coupon.minOrderAmount,
          usageLimit: coupon.usageLimit,
          usedCount: coupon.usedCount,
          startsAt: coupon.startsAt,
          endsAt: coupon.endsAt,
          active: coupon.active,
          createdAt: coupon.createdAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${coupons.length} coupons\n`);

    // 8. Migrate Orders
    console.log('📦 Migrating orders...');
    const orders = await sqlitePrisma.order.findMany();
    for (const order of orders) {
      await postgresPrisma.order.create({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          channel: order.channel,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          stateName: order.stateName,
          status: order.status,
          subtotal: order.subtotal,
          tax: order.tax,
          shippingCost: order.shippingCost,
          discountAmount: order.discountAmount,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          paymentTransactionId: order.paymentTransactionId,
          needsShippingReview: order.needsShippingReview,
          couponId: order.couponId,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${orders.length} orders\n`);

    // 9. Migrate Order Items
    console.log('📋 Migrating order items...');
    const orderItems = await sqlitePrisma.orderItem.findMany();
    for (const item of orderItems) {
      await postgresPrisma.orderItem.create({
        data: {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });
    }
    console.log(`   ✓ Migrated ${orderItems.length} order items\n`);

    // 10. Migrate Blog Posts
    console.log('📝 Migrating blog posts...');
    const posts = await sqlitePrisma.blogPost.findMany();
    for (const post of posts) {
      await postgresPrisma.blogPost.create({
        data: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          contentHtml: post.contentHtml,
          excerpt: post.excerpt,
          featuredImageUrl: post.featuredImageUrl,
          publishedAt: post.publishedAt,
          active: post.active,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${posts.length} blog posts\n`);

    // 11. Migrate Pages
    console.log('📄 Migrating pages...');
    const pages = await sqlitePrisma.page.findMany();
    for (const page of pages) {
      await postgresPrisma.page.create({
        data: {
          id: page.id,
          title: page.title,
          slug: page.slug,
          contentHtml: page.contentHtml,
          active: page.active,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${pages.length} pages\n`);

    // 12. Migrate Carousel Items
    console.log('🎠 Migrating carousel items...');
    const carousel = await sqlitePrisma.carouselItem.findMany();
    for (const item of carousel) {
      await postgresPrisma.carouselItem.create({
        data: {
          id: item.id,
          imageUrl: item.imageUrl,
          targetUrl: item.targetUrl,
          altText: item.altText,
          displayOrder: item.displayOrder,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    }
    console.log(`   ✓ Migrated ${carousel.length} carousel items\n`);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Product Images: ${images.length}`);
    console.log(`   Variants: ${variants.length}`);
    console.log(`   Shipping Rates: ${shipping.length}`);
    console.log(`   Coupons: ${coupons.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Order Items: ${orderItems.length}`);
    console.log(`   Blog Posts: ${posts.length}`);
    console.log(`   Pages: ${pages.length}`);
    console.log(`   Carousel Items: ${carousel.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

migrate();
