/**
 * Brix - Template Selector Component
 * Task #9681 - MVP: Storefront template selection UI
 */

import React, { useState, useEffect } from 'react'
import { Check, Eye, Sparkles } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  preview_image: string
  thumbnail: string
  features: string[]
  is_premium: boolean
  default_settings: {
    primaryColor: string
    secondaryColor: string
    font: string
  }
}

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void
  selectedTemplateId?: string
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplateId
}) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [categoryFilter])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const res = await fetch(`/api/templates?${params}`)
      const data = await res.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async (template: Template) => {
    setPreviewTemplate(template)
    // In real implementation, this would open a modal with live preview
  }

  const categories = ['all', 'minimal', 'modern', 'classic', 'bold']

  return (
    <div className="template-selector">
      {/* Header */}
      <div className="header">
        <h2>Choose Your Template</h2>
        <p>Select a starting point for your storefront. You can customize everything later.</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={categoryFilter === category ? 'active' : ''}
            onClick={() => setCategoryFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={template.id === selectedTemplateId}
              onSelect={() => onSelect(template.id)}
              onPreview={() => handlePreview(template)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            onSelect(previewTemplate.id)
            setPreviewTemplate(null)
          }}
        />
      )}
    </div>
  )
}

const TemplateCard: React.FC<{
  template: Template
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
}> = ({ template, isSelected, onSelect, onPreview }) => {
  return (
    <div className={`template-card ${isSelected ? 'selected' : ''}`}>
      <div className="template-preview">
        <img src={template.thumbnail} alt={template.name} />
        {template.is_premium && (
          <div className="premium-badge">
            <Sparkles size={16} /> Premium
          </div>
        )}
        {isSelected && (
          <div className="selected-badge">
            <Check size={20} /> Selected
          </div>
        )}
      </div>

      <div className="template-info">
        <h3>{template.name}</h3>
        <p className="description">{template.description}</p>

        <div className="features">
          {template.features.slice(0, 3).map((feature, i) => (
            <span key={i} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>

        <div className="template-actions">
          <button className="btn-secondary" onClick={onPreview}>
            <Eye size={16} /> Preview
          </button>
          <button
            className={isSelected ? 'btn-success' : 'btn-primary'}
            onClick={onSelect}
          >
            {isSelected ? (
              <>
                <Check size={16} /> Selected
              </>
            ) : (
              'Select'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const TemplatePreviewModal: React.FC<{
  template: Template
  onClose: () => void
  onSelect: () => void
}> = ({ template, onClose, onSelect }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{template.name} Preview</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <img
            src={template.preview_image}
            alt={`${template.name} preview`}
            className="preview-image"
          />

          <div className="template-details">
            <h3>Features</h3>
            <ul>
              {template.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <h3>Default Colors</h3>
            <div className="color-swatches">
              <div
                className="swatch"
                style={{ backgroundColor: template.default_settings.primaryColor }}
                title="Primary"
              />
              <div
                className="swatch"
                style={{ backgroundColor: template.default_settings.secondaryColor }}
                title="Secondary"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={onSelect}>
            Select Template
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplateSelector
