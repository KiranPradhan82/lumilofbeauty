import { db } from '../src/lib/db'

async function seed() {
  // Seed categories
  const categoriesData = [
    { name: 'Makeup', slug: 'makeup', icon: 'Sparkles', sortOrder: 0 },
    { name: 'Nails', slug: 'nails', icon: 'HandMetal', sortOrder: 1 },
    { name: 'Skincare', slug: 'skincare', icon: 'Droplets', sortOrder: 2 },
    { name: 'Hair', slug: 'hair', icon: 'Scissors', sortOrder: 3 },
    { name: 'Bridal', slug: 'bridal', icon: 'Heart', sortOrder: 4 },
  ]

  const catMap: Record<string, string> = {}
  for (const c of categoriesData) {
    const cat = await db.serviceCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, sortOrder: c.sortOrder },
      create: c,
    })
    catMap[c.slug] = cat.id
  }

  // Seed services
  const servicesData = [
    { name: 'Party Makeup', slug: 'party-makeup', description: 'Glamorous party-ready makeup with long-lasting formula.', price: 2500, duration: 60, categoryId: catMap['makeup'], featured: true, sortOrder: 0 },
    { name: 'Bridal Makeup', slug: 'bridal-makeup', description: 'Your dream bridal look crafted by expert artists.', price: 8000, duration: 120, categoryId: catMap['makeup'], featured: true, sortOrder: 1 },
    { name: 'Natural Makeup', slug: 'natural-makeup', description: 'Subtle everyday makeup that enhances your natural beauty.', price: 1500, duration: 45, categoryId: catMap['makeup'], featured: false, sortOrder: 2 },
    { name: 'Editorial Makeup', slug: 'editorial-makeup', description: 'Bold creative looks for photoshoots and fashion events.', price: 5000, duration: 90, categoryId: catMap['makeup'], featured: false, sortOrder: 3 },
    { name: 'Gel Manicure', slug: 'gel-manicure', description: 'Long-lasting gel polish manicure with nail shaping and cuticle care.', price: 1200, duration: 60, categoryId: catMap['nails'], featured: true, sortOrder: 0 },
    { name: 'Acrylic Extensions', slug: 'acrylic-extensions', description: 'Beautiful acrylic nail extensions with custom shapes.', price: 3000, duration: 120, categoryId: catMap['nails'], featured: false, sortOrder: 1 },
    { name: 'Nail Art', slug: 'nail-art', description: 'Hand-painted nail art designs from minimalist to intricate.', price: 2000, duration: 90, categoryId: catMap['nails'], featured: true, sortOrder: 2 },
    { name: 'Spa Pedicure', slug: 'spa-pedicure', description: 'Luxurious pedicure with foot soak, exfoliation, and massage.', price: 1800, duration: 75, categoryId: catMap['nails'], featured: false, sortOrder: 3 },
    { name: 'Signature Facial', slug: 'signature-facial', description: 'Our signature multi-step facial treatment with deep cleansing.', price: 2000, duration: 60, categoryId: catMap['skincare'], featured: true, sortOrder: 0 },
    { name: 'Hydra Glow Treatment', slug: 'hydra-glow-treatment', description: 'Intensive hydration treatment with hyaluronic acid serums.', price: 3500, duration: 75, categoryId: catMap['skincare'], featured: false, sortOrder: 1 },
    { name: 'Chemical Peel', slug: 'chemical-peel', description: 'Professional chemical peel for hyperpigmentation and fine lines.', price: 2500, duration: 45, categoryId: catMap['skincare'], featured: false, sortOrder: 2 },
    { name: 'Hair Styling', slug: 'hair-styling', description: 'Professional blowout and styling for any occasion.', price: 1500, duration: 60, categoryId: catMap['hair'], featured: true, sortOrder: 0 },
    { name: 'Hair Coloring', slug: 'hair-coloring', description: 'Expert hair coloring with premium ammonia-free formulas.', price: 4000, duration: 120, categoryId: catMap['hair'], featured: false, sortOrder: 1 },
    { name: 'Keratin Treatment', slug: 'keratin-treatment', description: 'Smoothing keratin treatment eliminating frizz for months.', price: 6000, duration: 150, categoryId: catMap['hair'], featured: false, sortOrder: 2 },
    { name: 'Complete Bridal Package', slug: 'complete-bridal-package', description: 'All-inclusive bridal package: makeup, hair, nails, facial.', price: 15000, duration: 240, categoryId: catMap['bridal'], featured: true, sortOrder: 0 },
    { name: 'Pre-Bridal Package', slug: 'pre-bridal-package', description: 'Pre-wedding treatment series for your best look.', price: 8000, duration: 180, categoryId: catMap['bridal'], featured: false, sortOrder: 1 },
  ]

  for (const svc of servicesData) {
    await db.service.upsert({
      where: { slug: svc.slug },
      update: { name: svc.name, description: svc.description, price: svc.price, duration: svc.duration, categoryId: svc.categoryId, featured: svc.featured, sortOrder: svc.sortOrder, isActive: true },
      create: svc,
    })
  }

  // Seed default settings
  const defaultSettings = {
    companyName: 'Lumil of Beauty',
    companyEmail: 'hello@lumilofbeauty.com',
    companyPhone: '+977-9801234567',
    companyAddress: 'Jhamsikhel, Lalitpur, Kathmandu, Nepal',
    logoUrl: '',
  }
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }

  console.log('Seed completed successfully!')
}

seed().catch(console.error).finally(() => db.$disconnect())