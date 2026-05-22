import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faServer, faBoxes, faDatabase, faChartLine, faCog, faUsers, faFileAlt, faShield, faDesktop, faBook, faBell, faKey, faPlug, faChartBar, faPalette, faGlobe, faLock, faCheck, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import { useProductSwitcher } from '../components/ProductSwitcher';

interface MenuItem {
  key: string;
  label: string;
  icon: any;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: 'overview',
    label: '数据服务概览',
    icon: faChartLine,
    children: [
      { key: 'dashboard', label: '数据概览', icon: faChartLine, path: '/service-console/dashboard' },
      { key: 'analytics', label: '数据分析', icon: faChartBar, path: '/service-console/analytics' },
    ]
  },
  {
    key: 'tech-service',
    label: '数据技术服务',
    icon: faServer,
    children: [
      { key: 'api-management', label: 'API管理', icon: faPlug, path: '/service-console/tech-service' },
      { key: 'data-catalog', label: '数据目录', icon: faBook, path: '/service-console/data-catalog' },
      { key: 'data-quality', label: '数据质量', icon: faCheck, path: '/service-console/data-quality' },
    ]
  },
  {
    key: 'resource-management',
    label: '平台资源管理',
    icon: faBoxes,
    children: [
      { key: 'compute', label: '计算资源', icon: faDesktop, path: '/service-console/resource-management' },
      { key: 'storage', label: '存储资源', icon: faDatabase, path: '/service-console/storage' },
      { key: 'network', label: '网络资源', icon: faGlobe, path: '/service-console/network' },
    ]
  },
  {
    key: 'operation',
    label: '运维管理',
    icon: faCog,
    children: [
      { key: 'monitoring', label: '系统监控', icon: faDesktop, path: '/service-console/monitoring' },
      { key: 'logs', label: '日志管理', icon: faFileAlt, path: '/service-console/logs' },
      { key: 'alert', label: '告警中心', icon: faBell, path: '/service-console/alert' },
    ]
  },
  {
    key: 'security',
    label: '安全中心',
    icon: faShield,
    children: [
      { key: 'permission', label: '权限管理', icon: faKey, path: '/service-console/permission' },
      { key: 'audit', label: '审计日志', icon: faLock, path: '/service-console/audit' },
      { key: 'user-management', label: '用户管理', icon: faUsers, path: '/service-console/user-management' },
    ]
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: faCog,
    children: [
      { key: 'config', label: '配置管理', icon: faCog, path: '/service-console/config' },
      { key: 'appearance', label: '外观设置', icon: faPalette, path: '/service-console/appearance' },
    ]
  },
];

export default function ServiceConsole() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openDrawer } = useProductSwitcher();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['overview', 'tech-service']);

  const [systemName] = useState(() => {
    if (location.state?.systemName) {
      sessionStorage.setItem('currentSystemName', location.state.systemName);
      return location.state.systemName;
    }
    return sessionStorage.getItem('currentSystemName') || '数据服务系统';
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.children && item.children.length > 0) {
      toggleExpand(item.key);
    }
  };

  const isActive = (item: MenuItem) => {
    if (item.path) return location.pathname === item.path;
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar systemName={systemName} currentSystem="数据服务系统" onMenuClick={openDrawer} />
      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Left Sidebar */}
        <aside className={`bg-white border-r border-slate-200 py-4 flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
          {/* Collapse toggle */}
          <div className="flex items-center justify-between px-4 mb-4">
            {!collapsed && <h2 className="text-base font-semibold text-slate-800">数据服务系统</h2>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FontAwesomeIcon
                icon={faServer}
                className={`text-slate-500 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Menu */}
          <nav className="space-y-1 px-2">
            {menuItems.map(item => (
              <div key={item.key}>
                {/* Parent menu */}
                <div className="relative group">
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all border-r-2 ${
                      isActive(item)
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500'
                        : 'text-slate-600 hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-sm w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.children && (
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-xs transition-transform ${expandedKeys.includes(item.key) ? 'rotate-180' : ''}`}
                          />
                        )}
                      </>
                    )}
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </div>

                {/* Children */}
                {!collapsed && item.children && expandedKeys.includes(item.key) && (
                  <div className="ml-4 mt-1 space-y-1 pl-3">
                    {item.children.map(child => (
                      <button
                        key={child.key}
                        onClick={() => child.path && navigate(child.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors border-r-2 ${
                          location.pathname === child.path
                            ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-500'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-transparent'
                        }`}
                      >
                        <FontAwesomeIcon icon={child.icon} className="text-xs w-4" />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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