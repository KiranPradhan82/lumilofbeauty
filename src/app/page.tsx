'use client'

import { Navbar } from '@/components/lumil/Navbar'
import { Hero } from '@/components/lumil/Hero'
import { BannerSlider } from '@/components/lumil/BannerSlider'
import { Services } from '@/components/lumil/Services'
import { BookingSection } from '@/components/lumil/BookingSection'
import { WhyChooseUs } from '@/components/lumil/WhyChooseUs'
import { Testimonials } from '@/components/lumil/Testimonials'
import { Footer } from '@/components/lumil/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <BannerSlider />
        <Services />
        <BookingSection />
        <WhyChooseUs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}