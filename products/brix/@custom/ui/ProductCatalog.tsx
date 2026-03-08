/**
 * Brix - Product Catalog Component
 * Task #9681 - MVP: Product catalog creation UI
 */

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  sku?: string
  inventory: number
  status: 'draft' | 'active' | 'archived'
  categories: string[]
  created_at: string
}

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [search, statusFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-catalog">
      {/* Header */}
      <div className="header">
        <h1>Product Catalog</h1>
        <button className="btn-primary" onClick={() => window.location.href = '/products/new'}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Products</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <div className="view-toggle">
          <button
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
          >
            <Grid size={20} />
          </button>
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet</p>
          <button onClick={() => window.location.href = '/products/new'}>
            Create your first product
          </button>
        </div>
      ) : (
        <div className={`products-${view}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="placeholder">No image</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">${product.price.toFixed(2)}</p>
        <div className="meta">
          <span className={`status-badge status-${product.status}`}>
            {product.status}
          </span>
          <span className="inventory">
            {product.inventory} in stock
          </span>
        </div>
      </div>
      <div className="product-actions">
        <button onClick={() => window.location.href = `/products/${product.id}/edit`}>
          Edit
        </button>
      </div>
    </div>
  )
}

export default ProductCatalog
