import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ShopPulse AI database...');

  // 1. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@shoppulse.ai' },
    update: {},
    create: {
      email: 'demo@shoppulse.ai',
      name: 'Deniz Aksu',
      role: 'ADMIN',
      planTier: 'GROWTH_PRO',
    },
  });

  console.log(`👤 Demo User created: ${demoUser.email}`);

  // 2. Create Primary Store
  const store1 = await prisma.store.upsert({
    where: { shopifyDomain: 'luminafashion.myshopify.com' },
    update: {},
    create: {
      shopifyDomain: 'luminafashion.myshopify.com',
      storeName: 'Lumina Fashion Co.',
      currency: 'USD',
      accessToken: 'shpat_demo_secret_token_123',
      healthScore: 88.0,
      lastSyncAt: new Date(),
      members: {
        create: {
          userId: demoUser.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log(`🏬 Store created: ${store1.storeName}`);

  // 3. Create Benchmarks
  await prisma.storeBenchmark.upsert({
    where: {
      storeId_recordedMonth: {
        storeId: store1.id,
        recordedMonth: '2026-08',
      },
    },
    update: {},
    create: {
      storeId: store1.id,
      category: 'Fashion & Apparel',
      percentileRank: 84.0,
      categoryAvgAov: 58.4,
      categoryAvgConv: 2.1,
      recordedMonth: '2026-08',
    },
  });

  // 4. Create Community Posts
  await prisma.communityPost.createMany({
    data: [
      {
        authorId: demoUser.id,
        title: 'Ölü Stokları 4 Günde $14K Nakite Çeviren "Gizli VIP Bundle" Stratejimiz',
        content: 'Geçtiğimiz kıştan kalan 180 adet botu ana sayfada indirime sokmak yerine, mevcut e-posta listemize özel "Kombin Kutusu" yaptık.',
        category: 'TACTICS',
        likes: 47,
      },
      {
        authorId: demoUser.id,
        title: 'Meta Advantage+ Kampanyalarında ROAS Koruma Taktikleri',
        content: 'Shopify stok takibiyle reklamları senkronize etmek hayat kurtarıyor. Bir ürün 5 adedin altına indiğinde reklamı otomatik durdurmazsanız bütçe yanıyor.',
        category: 'GROWTH',
        likes: 62,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
