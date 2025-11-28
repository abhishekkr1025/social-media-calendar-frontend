/**
 * Content Templates Component
 * 
 * Save and reuse common post templates with variables
 */

import { useState, useEffect } from 'react';
import { Save, Copy, Trash2, Plus, X, FileText } from 'lucide-react';
import './ContentTemplates.css';

export function ContentTemplates({ onSelectTemplate, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    platforms: [],
    category: 'general',
    variables: []
  });

  const CATEGORIES = ['general', 'promotion', 'announcement', 'engagement', 'holiday'];
  const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const saved = localStorage.getItem('content_templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  };

  const saveTemplates = (updatedTemplates) => {
    localStorage.setItem('content_templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Please fill in name and content');
      return;
    }

    const template = {
      ...newTemplate,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    saveTemplates([...templates, template]);
    setNewTemplate({ name: '', content: '', platforms: [], category: 'general', variables: [] });
    setShowAddForm(false);
  };

  const deleteTemplate = (id) => {
    if (confirm('Delete this template?')) {
      saveTemplates(templates.filter(t => t.id !== id));
    }
  };

  const useTemplate = (template) => {
    // Increment usage count
    const updated = templates.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    saveTemplates(updated);

    // Pass template to parent
    onSelectTemplate(template);
  };

  const duplicateTemplate = (template) => {
    const duplicate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    saveTemplates([...templates, duplicate]);
  };

  const extractVariables = (content) => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()) : [];
  };

  const handleContentChange = (content) => {
    const variables = extractVariables(content);
    setNewTemplate({ ...newTemplate, content, variables });
  };

  const togglePlatform = (platform) => {
    const platforms = newTemplate.platforms.includes(platform)
      ? newTemplate.platforms.filter(p => p !== platform)
      : [...newTemplate.platforms, platform];
    setNewTemplate({ ...newTemplate, platforms });
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <div className="content-templates-overlay">
      <div className="content-templates">
        <div className="templates-header">
          <h2><FileText size={24} /> Content Templates</h2>
          <div className="header-actions">
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> New Template
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="add-template-form">
            <h3>Create New Template</h3>
            
            <div className="form-field">
              <label>Template Name</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="e.g., Product Launch"
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Content Template</label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Use {{variable}} for dynamic content. Example: Check out our {{product}} - now {{discount}}% off!"
                rows={6}
              />
              <small>Use {`{{variable}}`} syntax for dynamic content</small>
            </div>

            {newTemplate.variables.length > 0 && (
              <div className="variables-detected">
                <strong>Variables detected:</strong> {newTemplate.variables.join(', ')}
              </div>
            )}

            <div className="form-field">
              <label>Default Platforms</label>
              <div className="platform-toggles">
                {PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    className={`platform-toggle ${newTemplate.platforms.includes(platform) ? 'active' : ''}`}
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="save-btn" onClick={addTemplate}>
                <Save size={16} /> Save Template
              </button>
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="templates-list">
          {templates.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>No templates yet</p>
              <button onClick={() => setShowAddForm(true)}>
                Create Your First Template
              </button>
            </div>
          ) : (
            Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category} className="template-category">
                <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div className="template-grid">
                  {categoryTemplates.map(template => (
                    <div key={template.id} className="template-card">
                      <div className="template-header">
                        <h4>{template.name}</h4>
                        <span className="usage-count">Used {template.usageCount}x</span>
                      </div>
                      
                      <div className="template-content">
                        {template.content}
                      </div>

                      {template.variables.length > 0 && (
                        <div className="template-variables">
                          <small>Variables: {template.variables.join(', ')}</small>
                        </div>
                      )}

                      {template.platforms.length > 0 && (
                        <div className="template-platforms">
                          {template.platforms.map(p => (
                            <span key={p} className="platform-badge">{p}</span>
                          ))}
                        </div>
                      )}

                      <div className="template-actions">
                        <button 
                          className="use-btn"
                          onClick={() => useTemplate(template)}
                        >
                          Use Template
                        </button>
                        <button 
                          className="icon-btn"
                          onClick={() => duplicateTemplate(template)}
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          className="icon-btn delete"
                          onClick={() => deleteTemplate(template.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

