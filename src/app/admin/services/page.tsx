'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, Loader2, Search, Sparkles } from 'lucide-react'

interface Category { id: string; name: string; slug: string; icon: string | null; isActive: boolean; sortOrder: number }
interface Service {
  id: string; name: string; slug: string; description: string; price: number; duration: number
  categoryId: string; isActive: boolean; featured: boolean; sortOrder: number
  category: Category
}

const emptyService = { name: '', slug: '', description: '', price: 0, duration: 30, categoryId: '', isActive: true, featured: false, sortOrder: 0 }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyService)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    const [sRes, cRes] = await Promise.all([
      fetch('/api/admin/services').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ])
    if (sRes.success) setServices(sRes.data)
    if (cRes.success) setCategories(cRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyService); setDialogOpen(true) }
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, slug: s.slug, description: s.description, price: s.price, duration: s.duration, categoryId: s.categoryId, isActive: s.isActive, featured: s.featured, sortOrder: s.sortOrder }); setDialogOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, price: Number(form.price), duration: Number(form.duration), sortOrder: Number(form.sortOrder) }
    if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-')
    const res = await fetch(editing ? `/api/admin/services/${editing.id}` : '/api/admin/services', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) { setDialogOpen(false); fetchData() }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/services/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) { setDeleteTarget(null); fetchData() }
    setDeleting(false)
  }

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
          <Plus className="w-4 h-4 mr-2" />Add Service
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      {s.featured && <Badge className="bg-amber-100 text-amber-700 gap-1 text-xs"><Sparkles className="w-3 h-3" />Popular</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.category.name}</td>
                  <td className="px-4 py-3 font-medium">Rs. {s.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{s.duration} min</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(s)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No services found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Service name" className="mt-1.5" /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-from-name" className="mt-1.5" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Service description" className="mt-1.5 min-h-[80px]" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Price (Rs.)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="mt-1.5" /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="mt-1.5" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1.5" /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /><Label>Featured (Popular badge)</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} /><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.categoryId} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All associated booking links will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}