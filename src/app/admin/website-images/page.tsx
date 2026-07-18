'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Upload, Trash2, ImageIcon, RotateCcw } from 'lucide-react'

// Default image URLs — these are the current hardcoded values
const IMAGE_SECTIONS = {
  hero: {
    label: 'Hero Section',
    description: 'Floating beauty product images displayed on the homepage hero banner.',
    keys: [
      { key: 'heroImage1', label: 'Image 1 - Makeup Palette', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/497a47774493.jpg' },
      { key: 'heroImage2', label: 'Image 2 - Nail Polish Collection', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/60a81ddbb9ca.jpg' },
      { key: 'heroImage3', label: 'Image 3 - Makeup Kit', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/f4550df2907e.jpg' },
      { key: 'heroImage4', label: 'Image 4 - Nail Polish Bottles', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/302de3c55820.jpg' },
    ],
  },
  gallery: {
    label: 'Beauty Gallery',
    description: 'Images shown in the masonry gallery grid on the homepage.',
    keys: [
      { key: 'galleryImage1', label: 'Gallery 1 - Nail Art (Tall)', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/cd15e385424d.jpg', category: 'Nail Art' },
      { key: 'galleryImage2', label: 'Gallery 2 - Bridal', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/35ef42d1b4a9.jpg', category: 'Bridal' },
      { key: 'galleryImage3', label: 'Gallery 3 - Products', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/60a81ddbb9ca.jpg', category: 'Products' },
      { key: 'galleryImage4', label: 'Gallery 4 - Nail Art', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/7d36496e5190.jpg', category: 'Nail Art' },
      { key: 'galleryImage5', label: 'Gallery 5 - Bridal (Tall)', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/cff50f735055.jpg', category: 'Bridal' },
      { key: 'galleryImage6', label: 'Gallery 6 - Nail Art', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/d6d6726093f5.jpg', category: 'Nail Art' },
      { key: 'galleryImage7', label: 'Gallery 7 - Products', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/0f78ad409440.jpg', category: 'Products' },
      { key: 'galleryImage8', label: 'Gallery 8 - Nail Art', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/11a7ecc0bd59.jpg', category: 'Nail Art' },
      { key: 'galleryImage9', label: 'Gallery 9 - Bridal', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/dccdc27dabfe.jpg', category: 'Bridal' },
      { key: 'galleryImage10', label: 'Gallery 10 - Products', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/497a47774493.jpg', category: 'Products' },
    ],
  },
  howItWorks: {
    label: 'How It Works',
    description: 'Step-by-step images showing the booking process.',
    keys: [
      { key: 'hiwImage1', label: 'Step 1 - Browse & Choose', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/107c9e19e949.jpg' },
      { key: 'hiwImage2', label: 'Step 2 - Pick Date & Location', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/d6d6726093f5.jpg' },
      { key: 'hiwImage3', label: 'Step 3 - Artist Arrives Home', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/91d7aa2f2f6c.jpg' },
      { key: 'hiwImage4', label: 'Step 4 - Look & Feel Amazing', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/b4dd54b82d73.webp' },
    ],
  },
  parallax: {
    label: 'Parallax Dividers',
    description: 'Full-width parallax images between homepage sections.',
    keys: [
      { key: 'parallaxNailArt', label: 'Nail Art Divider', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/5b6c770a5f79.jpg' },
      { key: 'parallaxBridal', label: 'Bridal Divider', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/3cd9f08f82de.jpg' },
    ],
  },
  whyChooseUs: {
    label: 'Why Choose Us',
    description: 'Feature cards images on the Why Choose Us section.',
    keys: [
      { key: 'wcuImage1', label: 'Beauty at Your Doorstep', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/0124ad50d2c9.jpg' },
      { key: 'wcuImage2', label: 'Certified Home Artists', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/91d7aa2f2f6c.jpg' },
      { key: 'wcuImage3', label: 'Premium Products', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/f4550df2907e.jpg' },
      { key: 'wcuImage4', label: 'Personalized Consultation', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/e6525a3c519e.jpg' },
      { key: 'wcuImage5', label: 'Serving Ilam & Jhapa', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/cff50f735055.jpg' },
      { key: 'wcuImage6', label: '5,000+ Happy Homes', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/e41bebea0ee8.jpg' },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    description: 'Background images for the customer testimonials section.',
    keys: [
      { key: 'testimonialImage1', label: 'Testimonial 1', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/35ef42d1b4a9.jpg' },
      { key: 'testimonialImage2', label: 'Testimonial 2', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/cd15e385424d.jpg' },
      { key: 'testimonialImage3', label: 'Testimonial 3', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/3cd9f08f82de.jpg' },
      { key: 'testimonialImage4', label: 'Testimonial 4', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/cff50f735055.jpg' },
      { key: 'testimonialImage5', label: 'Testimonial 5', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/0124ad50d2c9.jpg' },
      { key: 'testimonialImage6', label: 'Testimonial 6', defaultUrl: 'https://sfile.chatglm.cn/images-ppt/7d36496e5190.jpg' },
    ],
  },
} as const

type ImageKey = { key: string; label: string; defaultUrl: string; category?: string }

function ImageUploader({
  item,
  currentUrl,
  onUpload,
  onRemove,
  onReset,
}: {
  item: ImageKey
  currentUrl: string | undefined
  onUpload: (key: string, dataUrl: string) => void
  onRemove: (key: string) => void
  onReset: (key: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const displayUrl = localPreview || currentUrl || item.defaultUrl

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 800
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        onUpload(item.key, dataUrl)
        setUploading(false)
      }
      img.onerror = () => { setLocalPreview(null); setUploading(false) }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  const isCustom = !!currentUrl

  return (
    <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100 hover:border-pink-200 transition-colors">
      <div className="aspect-video bg-gray-50 relative">
        <img
          src={displayUrl}
          alt={item.label}
          className="w-full h-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
          </div>
        )}
        {/* Overlay actions on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 shadow-lg">
              <Upload className="w-3.5 h-3.5" />Change
            </span>
          </label>
          {isCustom && (
            <button
              onClick={() => { onRemove(item.key); setLocalPreview(null) }}
              className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 shadow-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />Remove
            </button>
          )}
          {isCustom && (
            <button
              onClick={() => { onReset(item.key); setLocalPreview(null) }}
              className="inline-flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 shadow-lg"
              title="Reset to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />Default
            </button>
          )}
        </div>
        {/* Category badge for gallery items */}
        {item.category && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-pink-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        )}
        {isCustom && !item.category && (
          <span className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Custom
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-gray-700 truncate">{item.label}</p>
      </div>
    </div>
  )
}

export default function WebsiteImagesPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(res => {
      if (res.success) setForm(res.data)
      setLoading(false)
    })
  }, [])

  const handleUpload = (key: string, dataUrl: string) => {
    setForm(f => ({ ...f, [key]: dataUrl }))
  }

  const handleRemove = (key: string) => {
    setForm(f => {
      const next = { ...f }
      delete next[key]
      return next
    })
  }

  const handleReset = (key: string) => {
    handleRemove(key)
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(json.error || 'Failed to save')
      }
    } catch (e: any) {
      setError(e.message || 'Network error')
    }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  const tabItems = Object.entries(IMAGE_SECTIONS).map(([sectionKey, section]) => ({
    key: sectionKey,
    label: section.label,
    description: section.description,
    keys: section.keys,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Website Images</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload custom images for each section of the website. If no custom image is set, the default will be used. All images are resized to max 800px and stored securely.
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 p-1">
          {tabItems.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabItems.map(t => (
          <TabsContent key={t.key} value={t.key}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-5 h-5 text-pink-500" />
                  {t.label}
                </CardTitle>
                <p className="text-sm text-gray-500">{t.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {t.keys.map(item => (
                    <ImageUploader
                      key={item.key}
                      item={item as ImageKey}
                      currentUrl={form[item.key]}
                      onUpload={handleUpload}
                      onRemove={handleRemove}
                      onReset={handleReset}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All Images'}
        </Button>
        {saved && <span className="text-green-600 text-sm">All image changes saved successfully!</span>}
      </div>
    </div>
  )
}