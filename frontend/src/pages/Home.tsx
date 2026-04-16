import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSystems, getConfig, System } from '../services/api';
import SystemCard from '../components/SystemCard';

function Home() {
  const [systems, setSystems] = useState<System[]>([]);
  const [systemName, setSystemName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSystems(), getConfig()]).then(([systemsData, configData]) => {
      setSystems(systemsData.filter((s: System) => s.enabled));
      setSystemName(configData.systemName || '天机智信 运营管理系统');
      setLoading(false);
    });
  }, []);

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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>{systemName}</h1>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>首页</Link>
          <Link to="/config" style={{ color: '#6b7280', textDecoration: 'none' }}>配置管理</Link>
        </nav>
      </header>
      <main style={{ padding: '48px 32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#374151', marginBottom: '32px' }}>子系统列表</h2>
        {systems.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>暂无启用的子系统</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {systems.map(system => (
              <SystemCard key={system.id} system={system} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
