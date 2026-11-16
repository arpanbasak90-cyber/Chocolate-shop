import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { INITIAL_PRODUCTS, CATEGORIES } from '../../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

async function main() {
  console.log(`🍫 Seeding Zora Shop Production Database with exactly ${INITIAL_PRODUCTS.length} Official Chocolates...`);

  // 1. Seed Categories (Idempotent)
  const categoryMap = {};
  for (const catName of CATEGORIES) {
    if (catName === 'All Chocolates') continue;
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        slug,
        description: `Handcrafted ${catName} boutique homemade creations.`
      }
    });
    categoryMap[catName] = category.id;
  }
  console.log(`✅ Categories verified: ${Object.keys(categoryMap).length}`);

  // 2. Seed Exactly 9 Official Products (Idempotent Upsert)
  let seededCount = 0;
  const activeSlugs = [];

  for (const prod of INITIAL_PRODUCTS) {
    activeSlugs.push(prod.slug);
    const categoryId = categoryMap[prod.category] || null;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        categoryId,
        piecePrice: prod.piecePrice,
        boxPrice: prod.boxPrice,
        approxPiecesPer250g: prod.approxPiecesPer250g,
        tag: prod.tag,
        badge: prod.badge,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        ingredients: JSON.stringify(prod.ingredients || []),
        dietary: prod.dietary || '100% Pure Vegetarian',
        shelfLife: prod.shelfLife,
        isAvailable: true,
        isBestseller: !!prod.isBestseller,
        image: prod.image,
        prepTime: prod.prepTime
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        categoryId,
        piecePrice: prod.piecePrice,
        boxPrice: prod.boxPrice,
        approxPiecesPer250g: prod.approxPiecesPer250g,
        tag: prod.tag,
        badge: prod.badge,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        ingredients: JSON.stringify(prod.ingredients || []),
        dietary: prod.dietary || '100% Pure Vegetarian',
        shelfLife: prod.shelfLife,
        isAvailable: true,
        isBestseller: !!prod.isBestseller,
        image: prod.image,
        prepTime: prod.prepTime
      }
    });
    seededCount++;
  }
  console.log(`✅ Official Products seeded/verified: ${seededCount} chocolates`);

  // 3. Safe archiving: Deactivate obsolete products without deleting (preserves historical orders & foreign keys)
  const archiveResult = await prisma.product.updateMany({
    where: {
      slug: { notIn: activeSlugs },
      isAvailable: true
    },
    data: {
      isAvailable: false
    }
  });
  if (archiveResult.count > 0) {
    console.log(`📦 Archived ${archiveResult.count} obsolete products safely (historical orders intact).`);
  }

  // 4. Seed Default Store Settings (Idempotent)
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'ZORA SHOP',
      tagline: 'Sweetness in Every Bite!',
      whatsappNumber: '+91 6289760577',
      contactEmail: 'abhijitsaha23485@gmail.com',
      shopAddress: 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India',
      deliveryFeeThreshold: 500,
      standardDeliveryFee: 40,
      isCodEnabled: true,
      isOnlinePaymentEnabled: true
    }
  });
  console.log('✅ Store Settings verified.');
  console.log('🎉 Production Catalogue Seed Ready!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
