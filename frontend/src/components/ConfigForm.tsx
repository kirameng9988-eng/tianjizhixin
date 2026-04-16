import { useState } from 'react';
import { System } from '../services/api';

interface ConfigFormProps {
  system?: System;
  onSave: (data: Omit<System, 'id'>) => void;
  onCancel: () => void;
}

function ConfigForm({ system, onSave, onCancel }: ConfigFormProps) {
  const [formData, setFormData] = useState<Omit<System, 'id'>>({
    name: system?.name || '',
    logo: system?.logo || '',
    description: system?.description || '',
    url: system?.url || '',
    enabled: system?.enabled ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>系统名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Logo URL</label>
        <input
          type="text"
          value={formData.logo}
          onChange={e => setFormData({ ...formData, logo: e.target.value })}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>描述</label>
        <input
          type="text"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>访问地址</label>
        <input
          type="text"
          value={formData.url}
          onChange={e => setFormData({ ...formData, url: e.target.value })}
          required
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
        />
        <label htmlFor="enabled" style={{ fontSize: '14px' }}>启用</label>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          type="submit"
          style={{
            padding: '8px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 20px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          取消
        </button>
      </div>
    </form>
  );
}

export default ConfigForm;
