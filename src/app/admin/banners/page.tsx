'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  Plus, Pencil, Trash2, Image, Video, GripVertical, Eye, EyeOff,
} from 'lucide-react'

interface Service {
  id: string
  name: string
}

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  videoUrl: string | null
  serviceId: string | null
  service: Service | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
}

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  videoUrl: '',
  serviceId: '',
  linkUrl: '',
  sortOrder: 0,
  isActive: true,
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/banners')
      const json = await res.json()
      if (json.success) setBanners(json.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      const json = await res.json()
      if (json.success) setServices(json.data || [])
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { fetchBanners(); fetchServices() }, [fetchBanners, fetchServices])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sortOrder: banners.length })
    setDialogOpen(true)
  }

  const openEdit = (b: Banner) => {
    setEditingId(b.id)
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      videoUrl: b.videoUrl || '',
      serviceId: b.serviceId || '',
      linkUrl: b.linkUrl || '',
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        serviceId: form.serviceId || null,
        linkUrl: form.linkUrl || null,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        subtitle: form.subtitle || null,
      }
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        setDialogOpen(false)
        fetchBanners()
      } else {
        alert(json.error || 'Failed to save')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to save banner')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) fetchBanners()
      else alert(json.error || 'Failed to delete')
    } catch (e) { console.error(e) }
    setDeleting(null)
  }

  const toggleActive = async (b: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !b.isActive }),
      })
      const json = await res.json()
      if (json.success) fetchBanners()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage homepage banner slider — photos and videos of your work
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Banner' : 'New Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Beautiful Bridal Makeup by Sita"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Optional subtitle or tagline"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <div className="relative mt-1.5">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label>Video URL (MP4)</Label>
                <div className="relative mt-1.5">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    className="pl-10 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Use either image or video. Video takes priority.</p>
              </div>
              <div>
                <Label>Link to Service (optional)</Label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full mt-1.5 h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white"
                >
                  <option value="">None — use custom link</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Custom Link URL (optional)</Label>
                <Input
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://external-link.com"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-24 rounded-xl text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No banners yet</p>
          <p className="text-sm text-gray-400 mt-1">Add photos and videos to showcase your beautiful work</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {banners.map((banner, idx) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <GripVertical className="w-5 h-5 text-gray-300 shrink-0" />
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                  {idx + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {banner.videoUrl ? (
                    <div className="flex items-center gap-1 text-pink-500">
                      <Video className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Video</span>
                    </div>
                  ) : banner.imageUrl ? (
                    <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{banner.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {banner.service && (
                      <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
                        {banner.service.name}
                      </span>
                    )}
                    {banner.linkUrl && !banner.service && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        External Link
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(banner)} title={banner.isActive ? 'Deactivate' : 'Activate'}>
                    {banner.isActive ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => handleDelete(banner.id)}
                    disabled={deleting === banner.id}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}