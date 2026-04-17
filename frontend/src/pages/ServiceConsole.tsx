import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faBoxes } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';

const menuItems = [
  { key: 'tech-service', label: '数据技术服务', icon: faServer, path: '/service-console/tech-service' },
  { key: 'resource-management', label: '平台资源管理', icon: faBoxes, path: '/service-console/resource-management' },
];

export default function ServiceConsole() {
  const location = useLocation();
  const navigate = useNavigate();
  const [systemName] = useState(() => {
    if (location.state?.systemName) {
      sessionStorage.setItem('currentSystemName', location.state.systemName);
      return location.state.systemName;
    }
    return sessionStorage.getItem('currentSystemName') || '运营管理系统';
  });

  const activeKey = menuItems.find(item => location.pathname === item.path)?.key || 'tech-service';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar systemName={systemName} currentSystem={systemName} />
      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Left Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 py-6 flex-shrink-0">
          <div className="px-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">控制台</h2>
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeKey === item.key
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-sm w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}