import { db } from '../src/lib/db'

async function seed() {
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

  const servicesData = [
    // Makeup
    { name: 'Party Makeup', slug: 'party-makeup', description: 'Glamorous party-ready makeup with long-lasting formula. Perfect for nights out and special celebrations. Includes primer, foundation, contouring, eye makeup, and lip color.', price: 2500, duration: 60, categoryId: catMap['makeup'], featured: true, sortOrder: 0 },
    { name: 'Bridal Makeup', slug: 'bridal-makeup', description: 'Your dream bridal look crafted by expert artists. Includes pre-bridal skin prep, HD airbrush foundation, eye makeup, and waterproof finishing.', price: 8000, duration: 120, categoryId: catMap['makeup'], featured: true, sortOrder: 1 },
    { name: 'Natural Makeup', slug: 'natural-makeup', description: 'Subtle, everyday makeup that enhances your natural beauty. Light coverage with dewy finish for that fresh-faced glow.', price: 1500, duration: 45, categoryId: catMap['makeup'], featured: false, sortOrder: 2 },
    { name: 'Editorial Makeup', slug: 'editorial-makeup', description: 'Bold, creative makeup looks for photoshoots and fashion events. Avant-garde styles that make a statement.', price: 5000, duration: 90, categoryId: catMap['makeup'], featured: false, sortOrder: 3 },
    // Nails
    { name: 'Gel Manicure', slug: 'gel-manicure', description: 'Long-lasting gel polish manicure with nail shaping, cuticle care, hand massage, and chip-resistant color that lasts up to 3 weeks.', price: 1200, duration: 60, categoryId: catMap['nails'], featured: true, sortOrder: 0 },
    { name: 'Acrylic Extensions', slug: 'acrylic-extensions', description: 'Beautiful acrylic nail extensions with custom shapes and lengths. Includes application, shaping, and your choice of polish.', price: 3000, duration: 120, categoryId: catMap['nails'], featured: false, sortOrder: 1 },
    { name: 'Nail Art', slug: 'nail-art', description: 'Hand-painted nail art designs from minimalist lines to intricate floral patterns. Let our artists create tiny masterpieces on your nails.', price: 2000, duration: 90, categoryId: catMap['nails'], featured: true, sortOrder: 2 },
    { name: 'Spa Pedicure', slug: 'spa-pedicure', description: 'Luxurious pedicure with foot soak, exfoliation, callus treatment, massage, and perfect polish application.', price: 1800, duration: 75, categoryId: catMap['nails'], featured: false, sortOrder: 3 },
    // Skincare
    { name: 'Signature Facial', slug: 'signature-facial', description: 'Our signature multi-step facial treatment with deep cleansing, exfoliation, extraction, serum infusion, and moisturizing. Customized for your skin type.', price: 2000, duration: 60, categoryId: catMap['skincare'], featured: true, sortOrder: 0 },
    { name: 'Hydra Glow Treatment', slug: 'hydra-glow-treatment', description: 'Intensive hydration treatment that leaves skin plump and radiant. Uses hyaluronic acid serums and LED light therapy for instant glow.', price: 3500, duration: 75, categoryId: catMap['skincare'], featured: false, sortOrder: 1 },
    { name: 'Chemical Peel', slug: 'chemical-peel', description: 'Professional chemical peel to address hyperpigmentation, acne scars, and fine lines. Customized strength for your skin concerns.', price: 2500, duration: 45, categoryId: catMap['skincare'], featured: false, sortOrder: 2 },
    // Hair
    { name: 'Hair Styling', slug: 'hair-styling', description: 'Professional blowout and styling for any occasion. From sleek straight to bouncy curls, we create the perfect look for your hair type.', price: 1500, duration: 60, categoryId: catMap['hair'], featured: true, sortOrder: 0 },
    { name: 'Hair Coloring', slug: 'hair-coloring', description: 'Expert hair coloring services from subtle highlights to bold fashion colors. Uses premium ammonia-free formulas to protect your hair.', price: 4000, duration: 120, categoryId: catMap['hair'], featured: false, sortOrder: 1 },
    { name: 'Keratin Treatment', slug: 'keratin-treatment', description: 'Smoothing keratin treatment that eliminates frizz and adds mirror-like shine. Results last up to 3 months with proper care.', price: 6000, duration: 150, categoryId: catMap['hair'], featured: false, sortOrder: 2 },
    // Bridal
    { name: 'Complete Bridal Package', slug: 'complete-bridal-package', description: 'All-inclusive bridal package featuring bridal makeup, hairstyling, mehendi consultation, pre-bridal facial, and nail services. The ultimate bridal experience.', price: 15000, duration: 240, categoryId: catMap['bridal'], featured: true, sortOrder: 0 },
    { name: 'Pre-Bridal Package', slug: 'pre-bridal-package', description: 'A series of treatments in the weeks before your wedding to ensure you look your absolute best. Includes facials, body polish, and hair treatments.', price: 8000, duration: 180, categoryId: catMap['bridal'], featured: false, sortOrder: 1 },
  ]

  for (const svc of servicesData) {
    await db.service.upsert({
      where: { slug: svc.slug },
      update: {
        name: svc.name,
        description: svc.description,
        price: svc.price,
        duration: svc.duration,
        categoryId: svc.categoryId,
        featured: svc.featured,
        sortOrder: svc.sortOrder,
        isActive: true,
      },
      create: svc,
    })
  }

  console.log('Seed completed successfully!')
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())