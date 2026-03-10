// @custom/ui/TemplateLibrary.jsx - Template Library UI Component

import React, { useState, useEffect } from 'react';
import './TemplateLibrary.css';

/**
 * Template Library Component
 * Browse, search, and select templates
 */
const TemplateLibrary = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  
  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, [selectedType, selectedCategory, selectedVisibility, searchQuery]);
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedVisibility !== 'all') params.append('visibility', selectedVisibility);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();
      setTemplates(data.templates || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectTemplate = async (template) => {
    // Record usage
    try {
      await fetch(`/api/templates/${template.id}/use`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to record template usage:', err);
    }
    
    onSelectTemplate(template);
  };
  
  const handleDuplicateTemplate = async (template, e) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/templates/${template.id}/duplicate`, {
        method: 'POST'
      });
      const data = await response.json();
      
      // Add duplicated template to list
      setTemplates([data.template, ...templates]);
      
      // Show success message
      alert(`Template "${template.name}" duplicated successfully!`);
    } catch (err) {
      console.error('Failed to duplicate template:', err);
      alert('Failed to duplicate template');
    }
  };
  
  return (
    <div className="template-library">
      <div className="template-library-header">
        <h2>📚 Template Library</h2>
        <button onClick={onClose} className="close-button">✕</button>
      </div>
      
      {/* Filters */}
      <div className="template-filters">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="announcement">Announcement</option>
          <option value="poll">Poll</option>
          <option value="case_study">Case Study</option>
          <option value="product_launch">Product Launch</option>
          <option value="event_invite">Event Invite</option>
          <option value="newsletter">Newsletter</option>
          <option value="promotion">Promotion</option>
          <option value="update">Update</option>
          <option value="custom">Custom</option>
        </select>
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Engagement">Engagement</option>
          <option value="Events">Events</option>
          <option value="Support">Support</option>
        </select>
        
        <select 
          value={selectedVisibility} 
          onChange={(e) => setSelectedVisibility(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public (System)</option>
          <option value="private">Private (My Templates)</option>
          <option value="team">Team</option>
        </select>
        
        <div className="view-toggle">
          <button 
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'active' : ''}
          >
            ⊞ Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'active' : ''}
          >
            ☰ List
          </button>
        </div>
      </div>
      
      {/* Templates */}
      <div className={`template-grid ${viewMode}`}>
        {loading && <div className="loading">Loading templates...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && templates.length === 0 && (
          <div className="empty-state">
            <p>No templates found matching your criteria.</p>
            <button onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedCategory('all');
              setSelectedVisibility('all');
            }}>
              Clear Filters
            </button>
          </div>
        )}
        
        {!loading && templates.map(template => (
          <TemplateCard
            key={template.id || template.name}
            template={template}
            onSelect={() => handleSelectTemplate(template)}
            onDuplicate={(e) => handleDuplicateTemplate(template, e)}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Template Card Component
 * Individual template preview
 */
const TemplateCard = ({ template, onSelect, onDuplicate, viewMode }) => {
  const typeEmoji = {
    announcement: '📢',
    poll: '📊',
    case_study: '📈',
    product_launch: '🚀',
    event_invite: '🎉',
    newsletter: '📰',
    promotion: '🎁',
    update: '📝',
    custom: '✨'
  };
  
  return (
    <div className={`template-card ${viewMode}`} onClick={onSelect}>
      <div className="template-icon">
        {typeEmoji[template.type] || '📄'}
      </div>
      
      <div className="template-content">
        <h3 className="template-name">{template.name}</h3>
        {template.description && (
          <p className="template-description">{template.description}</p>
        )}
        
        <div className="template-meta">
          {template.type && (
            <span className="template-badge type-badge">
              {template.type.replace('_', ' ')}
            </span>
          )}
          
          {template.category && (
            <span className="template-badge category-badge">
              {template.category}
            </span>
          )}
          
          {template.isSystemTemplate && (
            <span className="template-badge system-badge">
              System
            </span>
          )}
          
          {template.stats?.usedCount > 0 && (
            <span className="template-stat">
              ✓ Used {template.stats.usedCount}x
            </span>
          )}
        </div>
        
        {template.channels && template.channels.length > 0 && (
          <div className="template-channels">
            {template.channels.map(channel => (
              <span key={channel} className="channel-badge">
                {channel === 'email' && '✉️'}
                {channel === 'sms' && '💬'}
                {channel === 'push' && '🔔'}
                {channel === 'social' && '🌐'}
                {channel}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="template-actions">
        <button 
          onClick={onSelect}
          className="use-button"
        >
          Use Template
        </button>
        
        {template.isSystemTemplate && (
          <button 
            onClick={onDuplicate}
            className="duplicate-button"
            title="Create a copy to customize"
          >
            📋 Duplicate
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Template Editor Component
 * Edit and customize template content
 */
const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    type: template?.type || 'custom',
    visibility: template?.visibility || 'private',
    content: {
      subject: template?.content?.subject || '',
      body: template?.content?.body || '',
      preview: template?.content?.preview || '',
      variables: template?.content?.variables || []
    },
    channels: template?.channels || ['email'],
    tags: template?.tags || [],
    category: template?.category || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const addVariable = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        variables: [
          ...formData.content.variables,
          { name: '', label: '', type: 'text', required: false }
        ]
      }
    });
  };
  
  const removeVariable = (index) => {
    const newVariables = [...formData.content.variables];
    newVariables.splice(index, 1);
    setFormData({
      ...formData,
      content: { ...formData.content, variables: newVariables }
    });
  };
  
  const updateVariable = (index, field, value) => {
    const newVariables = [...formData.content.variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, variables: newVariables }
    });
  };
  
  return (
    <div className="template-editor">
      <h2>{template ? 'Edit Template' : 'Create New Template'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Template Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="custom">Custom</option>
              <option value="announcement">Announcement</option>
              <option value="poll">Poll</option>
              <option value="case_study">Case Study</option>
              <option value="product_launch">Product Launch</option>
              <option value="event_invite">Event Invite</option>
              <option value="newsletter">Newsletter</option>
              <option value="promotion">Promotion</option>
              <option value="update">Update</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Visibility *</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              required
            >
              <option value="private">Private (Only Me)</option>
              <option value="team">Team (Workspace)</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Subject Line *</label>
          <input
            type="text"
            value={formData.content.subject}
            onChange={(e) => setFormData({
              ...formData,
              content: { ...formData.content, subject: e.target.value }
            })}
            placeholder="Use {{variable_name}} for dynamic content"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Body Content *</label>
          <textarea
            value={formData.content.body}
            onChange={(e) => setFormData({
              ...formData,
              content: { ...formData.content, body: e.target.value }
            })}
            placeholder="Use {{variable_name}} for dynamic content"
            rows={10}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Variables</label>
          {formData.content.variables.map((variable, index) => (
            <div key={index} className="variable-row">
              <input
                type="text"
                placeholder="Variable name (e.g., product_name)"
                value={variable.name}
                onChange={(e) => updateVariable(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Label (e.g., Product Name)"
                value={variable.label}
                onChange={(e) => updateVariable(index, 'label', e.target.value)}
              />
              <select
                value={variable.type}
                onChange={(e) => updateVariable(index, 'type', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={variable.required}
                  onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                />
                Required
              </label>
              <button type="button" onClick={() => removeVariable(index)}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addVariable} className="add-button">
            + Add Variable
          </button>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-button">
            Save Template
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export { TemplateLibrary, TemplateCard, TemplateEditor };
export default TemplateLibrary;
