import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCog, faChartLine, faDatabase, faSearch, faCube, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getSystems, getConfig, getRoles, System, Role } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [systems, setSystems] = useState<System[]>([]);
  const [systemName, setSystemName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [systemsData, configData, rolesData] = await Promise.all([
        getSystems(),
        getConfig(),
        getRoles()
      ]);

      const allSystems = Array.isArray(systemsData) ? systemsData : [];

      // Filter systems based on user role
      if (user && user.role !== 'admin') {
        const userRole = rolesData.find((r: Role) => r.id === user.roleId);
        if (userRole) {
          const accessibleSystems = allSystems.filter((s: System) =>
            userRole.systemIds.includes(s.id) && s.enabled
          );
          setSystems(accessibleSystems);
        } else {
          setSystems([]);
        }
      } else {
        // Admin can see all enabled systems
        setSystems(allSystems.filter((s: System) => s.enabled));
      }

      setSystemName(configData?.systemName || '天机智信 运营管理系统');
    } catch (err) {
      console.error('Failed to load data:', err);
      setSystems([]);
      setSystemName('运营管理系统');
    }
    setLoading(false);
  };

  const getSystemIcon = (name: string) => {
    if (name.includes('产品')) return faCube;
    if (name.includes('服务')) return faCog;
    if (name.includes('寻源') || name.includes('搜索')) return faSearch;
    if (name.includes('数据')) return faDatabase;
    return faChartLine;
  };

  const getSystemImage = (name: string) => {
    const images: Record<string, string> = {
      '自营数据产品系统': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      '自营数据服务系统': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      '找数寻源运营后台': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
    };
    return images[name] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop';
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

      <section className="pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
            欢迎使用 <span className="text-blue-500">运营管理平台</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            统一入口，一键直达各业务子系统，提升运营效率
          </p>
        </div>
      </section>

      <main className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faRocket} className="text-blue-500 text-sm" />
              </span>
              子系统列表
            </h3>
            <span className="text-slate-500 text-sm">{systems.length} 个系统已启用</span>
          </div>

          {systems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCog} className="text-slate-400 text-2xl" />
              </div>
              <p className="text-slate-700 text-lg">暂无访问权限的子系统</p>
              <p className="text-slate-500 text-sm mt-2">请联系管理员分配系统访问权限</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systems.map((system) => (
                <div
                  key={system.id}
                  className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    if (system.type === 'internal') {
                      navigate('/service-console', { state: { systemName: system.name } });
                    } else {
                      const url = system.urlGov || system.urlInternet;
                      if (url) {
                        window.location.href = url;
                      }
                    }
                  }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={getSystemImage(system.name)}
                      alt={system.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                        <FontAwesomeIcon icon={getSystemIcon(system.name)} className="text-slate-700 text-xl" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-600 text-xs font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        已启用
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-500 transition-colors">
                      {system.name}
                    </h4>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {system.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">iDAS 单点登录</span>
                      <span className="inline-flex items-center gap-2 text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        访问
                        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-slate-500 text-sm">
            <span>© 2024 天机智信. All rights reserved.</span>
            <span>Powered by iDAS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;