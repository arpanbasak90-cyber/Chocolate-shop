import { PrismaClient } from '@prisma/client';
import { INITIAL_PRODUCTS, CATEGORIES } from '../../src/data/products.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🍫 Seeding Zora Shop Production Database with 52 Real Products...');

  // 1. Seed Categories
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
  console.log(`✅ Categories seeded: ${Object.keys(categoryMap).length}`);

  // 2. Seed 52 Real Products
  let seededProducts = 0;
  for (const prod of INITIAL_PRODUCTS) {
    const categoryId = categoryMap[prod.category] || null;
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
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
        isAvailable: prod.isAvailable !== false,
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
        isAvailable: prod.isAvailable !== false,
        isBestseller: !!prod.isBestseller,
        image: prod.image,
        prepTime: prod.prepTime
      }
    });
    seededProducts++;
  }
  console.log(`✅ Real Products seeded: ${seededProducts}`);

  // 3. Seed Default Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'ZORA SHOP',
      tagline: 'Sweetness in Every Bite!',
      whatsappNumber: '+91 98980 14090',
      contactEmail: 'zorashop.homemade@gmail.com',
      shopAddress: 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India',
      deliveryFeeThreshold: 500,
      standardDeliveryFee: 40,
      isCodEnabled: true,
      isOnlinePaymentEnabled: true
    }
  });
  console.log('✅ Store Settings seeded.');
  console.log('🎉 Production Seed Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
