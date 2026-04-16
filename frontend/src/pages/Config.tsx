import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCog, faSave, faPlus, faEdit, faTrash, faToggleOn, faToggleOff, faCheck, faImage, faFont } from '@fortawesome/free-solid-svg-icons';
import { getSystems, getConfig, updateConfig, addSystem, updateSystem, deleteSystem, System } from '../services/api';
import ConfigForm from '../components/ConfigForm';
import Navbar from '../components/Navbar';

function Config() {
  const [systems, setSystems] = useState<System[]>([]);
  const [systemName, setSystemName] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [systemsData, configData] = await Promise.all([getSystems(), getConfig()]);
    setSystems(systemsData);
    setSystemName(configData.systemName || '');
    setLogo(configData.logo || '');
    setLoading(false);
  };

  const handleSaveSystem = async (data: Omit<System, 'id'>) => {
    if (editingSystem) {
      await updateSystem(editingSystem.id, data);
    } else {
      await addSystem(data);
    }
    setShowForm(false);
    setEditingSystem(null);
    loadData();
  };

  const handleEditSystem = (system: System) => {
    setEditingSystem(system);
    setShowForm(true);
  };

  const handleDeleteSystem = async (id: string) => {
    if (confirm('确定要删除该子系统吗？此操作不可撤销。')) {
      await deleteSystem(id);
      loadData();
    }
  };

  const handleToggleEnabled = async (system: System) => {
    await updateSystem(system.id, { enabled: !system.enabled });
    loadData();
  };

  const handleSaveConfig = async () => {
    await updateConfig({ systemName, logo });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar systemName={systemName} />

      <main className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCog} className="text-blue-500 text-sm" />
              </span>
              系统配置
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFont} className="text-slate-400 text-xs" />
                  系统名称
                </label>
                <input
                  type="text"
                  value={systemName}
                  onChange={e => setSystemName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="输入系统名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faImage} className="text-slate-400 text-xs" />
                  Logo URL
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={e => setLogo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="输入Logo URL"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleSaveConfig}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all shadow-sm"
              >
                <FontAwesomeIcon icon={faSave} className="text-sm" />
                保存配置
              </button>
              {saveSuccess && (
                <span className="inline-flex items-center gap-2 text-emerald-600 animate-fade-in">
                  <FontAwesomeIcon icon={faCheck} className="text-sm" />
                  保存成功
                </span>
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-500 text-sm" />
                </span>
                子系统管理
              </h2>
              {!showForm && (
                <button
                  onClick={() => { setEditingSystem(null); setShowForm(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-sm" />
                  添加子系统
                </button>
              )}
            </div>

            {showForm && (
              <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-scale-in">
                <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={editingSystem ? faEdit : faPlus} className="text-blue-500 text-sm" />
                  {editingSystem ? '编辑子系统' : '添加新子系统'}
                </h3>
                <ConfigForm
                  system={editingSystem || undefined}
                  onSave={handleSaveSystem}
                  onCancel={() => { setShowForm(false); setEditingSystem(null); }}
                />
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">名称</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">描述</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systems.map((system) => (
                    <tr key={system.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-slate-800 font-medium">{system.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 text-sm">{system.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          system.enabled
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${system.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {system.enabled ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleEnabled(system)}
                            className={`p-2 rounded-lg transition-all ${
                              system.enabled
                                ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
                            }`}
                            title={system.enabled ? '禁用' : '启用'}
                          >
                            <FontAwesomeIcon icon={system.enabled ? faToggleOn : faToggleOff} className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleEditSystem(system)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                            title="编辑"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteSystem(system.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                            title="删除"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {systems.length === 0 && (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faCog} className="text-slate-300 text-4xl mb-3" />
                  <p className="text-slate-500">暂无子系统</p>
                  <p className="text-slate-400 text-sm mt-1">点击上方按钮添加第一个子系统</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Config;