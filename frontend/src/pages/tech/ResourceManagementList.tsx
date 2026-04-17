import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes, faHdd } from '@fortawesome/free-solid-svg-icons';

interface Resource {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network';
  capacity: string;
  status: 'active' | 'inactive' | 'full';
  description: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Resource, 'id'>) => void;
  editingResource?: Resource | null;
}

function ResourceModal({ isOpen, onClose, onSave, editingResource }: ModalProps) {
  const [formData, setFormData] = useState<Omit<Resource, 'id'>>({
    name: editingResource?.name || '',
    type: editingResource?.type || 'compute',
    capacity: editingResource?.capacity || '',
    status: editingResource?.status || 'active',
    description: editingResource?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {editingResource ? '编辑资源' : '新增资源'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">资源名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="输入资源名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">资源类型</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="compute">计算资源</option>
                <option value="storage">存储资源</option>
                <option value="network">网络资源</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">容量</label>
              <input
                type="text"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="如：100 TB"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">状态</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as Resource['status'] })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="active">活跃</option>
              <option value="inactive">未激活</option>
              <option value="full">已满</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
              placeholder="简要描述资源用途"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const initialResources: Resource[] = [
  { id: '1', name: '主计算集群', type: 'compute', capacity: '64核 256GB', status: 'active', description: '主数据中心计算集群' },
  { id: '2', name: '数据存储池', type: 'storage', capacity: '500 TB', status: 'active', description: '海量数据存储池' },
  { id: '3', name: '负载均衡器', type: 'network', capacity: '10Gbps', status: 'active', description: '流量分发与负载均衡' },
  { id: '4', name: '备计算集群', type: 'compute', capacity: '32核 128GB', status: 'inactive', description: '灾备计算集群' },
];

export default function ResourceManagementList() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const handleAdd = () => {
    setEditingResource(null);
    setShowModal(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowModal(true);
  };

  const handleSave = (data: Omit<Resource, 'id'>) => {
    if (editingResource) {
      setResources(resources.map(r => r.id === editingResource.id ? { ...data, id: r.id } : r));
    } else {
      setResources([...resources, { ...data, id: Date.now().toString() }]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该资源吗？')) {
      setResources(resources.filter(r => r.id !== id));
    }
  };

  const getTypeBadge = (type: Resource['type']) => {
    const styles = {
      compute: 'bg-purple-50 text-purple-600 border-purple-200',
      storage: 'bg-amber-50 text-amber-600 border-amber-200',
      network: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    };
    const labels = { compute: '计算', storage: '存储', network: '网络' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>
        <FontAwesomeIcon icon={faHdd} className="text-xs" />
        {labels[type]}
      </span>
    );
  };

  const getStatusBadge = (status: Resource['status']) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      inactive: 'bg-slate-100 text-slate-500 border-slate-200',
      full: 'bg-red-50 text-red-600 border-red-200',
    };
    const labels = { active: '活跃', inactive: '未激活', full: '已满' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'inactive' ? 'bg-slate-400' : 'bg-red-500'}`}></span>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">平台资源管理</h2>
          <p className="text-slate-500 text-sm mt-1">管理和配置平台资源</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          新增资源
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">资源名称</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">类型</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">容量</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">描述</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map(resource => (
              <tr key={resource.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span className="text-slate-800 font-medium">{resource.name}</span>
                </td>
                <td className="px-6 py-4">
                  {getTypeBadge(resource.type)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 text-sm">{resource.capacity}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(resource.status)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 text-sm">{resource.description}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {resources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">暂无平台资源</p>
          </div>
        )}
      </div>

      <ResourceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        editingResource={editingResource}
      />
    </div>
  );
}
