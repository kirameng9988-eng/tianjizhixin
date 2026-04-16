import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">系统名称</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="如：自营数据产品系统"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
          <input
            type="text"
            value={formData.logo}
            onChange={e => setFormData({ ...formData, logo: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
          <input
            type="text"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="简要描述系统功能"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">访问地址</label>
          <input
            type="text"
            value={formData.url}
            onChange={e => setFormData({ ...formData, url: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="https://idas.example.com/redirect/..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
        />
        <label htmlFor="enabled" className="text-sm text-slate-600 cursor-pointer">启用该子系统</label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all shadow-sm"
        >
          <FontAwesomeIcon icon={faSave} className="text-sm" />
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
        >
          <FontAwesomeIcon icon={faTimes} className="text-sm" />
          取消
        </button>
      </div>
    </form>
  );
}

export default ConfigForm;