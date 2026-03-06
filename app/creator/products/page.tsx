'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number | null
  checkout_url: string
  is_active: boolean
  avatar_id: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('creator_products')
      .select('*')
      .eq('creator_id', user.id)
      .order('sort_order')
    setProducts(data || [])
  }

  useEffect(() => { loadProducts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addProduct = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('creator_products').insert({
      creator_id: user.id,
      name,
      price: price ? parseFloat(price) : null,
      checkout_url: url,
    })

    setName('')
    setPrice('')
    setUrl('')
    setShowForm(false)
    await loadProducts()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl gradient-btn text-sm font-medium">
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Product name" className="w-full px-4 py-2 rounded-xl bg-card border border-glass-border focus:outline-none" />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (USD)" type="number" className="w-full px-4 py-2 rounded-xl bg-card border border-glass-border focus:outline-none" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Checkout URL" className="w-full px-4 py-2 rounded-xl bg-card border border-glass-border focus:outline-none" />
          <button onClick={addProduct} disabled={!name || !url || loading} className="w-full py-2 rounded-xl gradient-btn font-medium disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">No products yet. Add products that your avatars can recommend.</p>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                {p.price && <p className="text-xs text-emerald-400">${p.price}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
