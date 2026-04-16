import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSystems, getConfig, updateConfig, addSystem, updateSystem, deleteSystem, System } from '../services/api';
import ConfigForm from '../components/ConfigForm';

function Config() {
  const [systems, setSystems] = useState<System[]>([]);
  const [systemName, setSystemName] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    if (confirm('确定要删除该子系统吗？')) {
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
    alert('配置已保存');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>配置管理</h1>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>首页</Link>
          <Link to="/config" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>配置管理</Link>
        </nav>
      </header>
      <main style={{ padding: '32px' }}>
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>系统配置</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>系统名称</label>
              <input
                type="text"
                value={systemName}
                onChange={e => setSystemName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Logo URL</label>
              <input
                type="text"
                value={logo}
                onChange={e => setLogo(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <button
              onClick={handleSaveConfig}
              style={{
                padding: '8px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              保存配置
            </button>
          </div>
        </section>
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>子系统管理</h2>
            {!showForm && (
              <button
                onClick={() => { setEditingSystem(null); setShowForm(true); }}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                添加子系统
              </button>
            )}
          </div>
          {showForm && (
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                {editingSystem ? '编辑子系统' : '添加子系统'}
              </h3>
              <ConfigForm
                system={editingSystem || undefined}
                onSave={handleSaveSystem}
                onCancel={() => { setShowForm(false); setEditingSystem(null); }}
              />
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>名称</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>描述</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>状态</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {systems.map(system => (
                <tr key={system.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 8px', fontSize: '14px' }}>{system.name}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>{system.description}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: system.enabled ? '#d1fae5' : '#f3f4f6',
                      color: system.enabled ? '#059669' : '#9ca3af'
                    }}>
                      {system.enabled ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleEnabled(system)}
                      style={{
                        padding: '4px 12px',
                        marginRight: '8px',
                        backgroundColor: system.enabled ? '#fef3c7' : '#d1fae5',
                        color: system.enabled ? '#d97706' : '#059669',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {system.enabled ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => handleEditSystem(system)}
                      style={{
                        padding: '4px 12px',
                        marginRight: '8px',
                        backgroundColor: '#e0e7ff',
                        color: '#4f46e5',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteSystem(system.id)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Config;
