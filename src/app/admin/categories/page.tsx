'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Category { id: string; name: string; slug: string; icon: string | null; isActive: boolean; sortOrder: number; _count?: { services: number } }

const empty = { name: '', slug: '', icon: '', sortOrder: 0, isActive: true }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/categories').then(r => r.json())
    if (res.success) setCategories(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, icon: c.icon || '', sortOrder: c.sortOrder, isActive: c.isActive }); setDialogOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, sortOrder: Number(form.sortOrder) }
    if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-')
    const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { setDialogOpen(false); fetchData() }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true); setDeleteError('')
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) { setDeleteTarget(null); fetchData() }
    else setDeleteError(data.error || 'Failed to delete')
    setDeleting(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Categories ({categories.length})</h2>
        <Button onClick={openCreate} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
          <Plus className="w-4 h-4 mr-2" />Add Category
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">/{c.slug}</p>
              </div>
              <Badge variant="secondary" className={c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                {c.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">Sort: {c.sortOrder}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5 mr-1.5" />Edit</Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Icon (lucide icon name)</Label><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. Sparkles" className="mt-1.5" /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1.5" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setDeleteError('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>{deleteError || 'This will permanently delete this category.'}</AlertDialogDescription>
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