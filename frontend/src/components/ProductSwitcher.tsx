import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';

// ============================================================================
// Context for external control
// ============================================================================
interface ProductSwitcherContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
  isDark: boolean;
}

const ProductSwitcherContext = createContext<ProductSwitcherContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
  isOpen: false,
  isDark: false,
});

export const useProductSwitcher = () => useContext(ProductSwitcherContext);

// ============================================================================
// 类型定义
// ============================================================================
interface SystemItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

// ============================================================================
// 模拟数据：20+系统按分类组织
// ============================================================================
const CATEGORIES: Category[] = [
  { id: 'infra', name: '基础设施', icon: '🖥️' },
  { id: 'data', name: '数据服务', icon: '🗄️' },
  { id: 'security', name: '安全中心', icon: '🛡️' },
  { id: 'devops', name: '研发运维', icon: '⚙️' },
  { id: 'business', name: '业务应用', icon: '📊' },
];

const ALL_SYSTEMS: SystemItem[] = [
  // 基础设施
  { id: 'ecs', name: '云服务器', icon: '🖥️', category: 'infra', description: '弹性计算服务', url: '/ecs' },
  { id: 'vpc', name: '私有网络', icon: '🌐', category: 'infra', description: '网络隔离配置', url: '/vpc' },
  { id: 'clb', name: '负载均衡', icon: '⚖️', category: 'infra', description: '流量分发管理', url: '/clb' },
  { id: 'cdn', name: 'CDN加速', icon: '🚀', category: 'infra', description: '内容分发网络', url: '/cdn' },
  // 数据服务
  { id: 'rds', name: '关系数据库', icon: '🗃️', category: 'data', description: 'MySQL/PostgreSQL', url: '/rds' },
  { id: 'redis', name: '缓存数据库', icon: '⚡', category: 'data', description: 'Redis集群', url: '/redis' },
  { id: 'mq', name: '消息队列', icon: '📨', category: 'data', description: 'Kafka/RabbitMQ', url: '/mq' },
  { id: 'es', name: '搜索引擎', icon: '🔍', category: 'data', description: 'ElasticSearch', url: '/es' },
  // 安全中心
  { id: 'cam', name: '访问控制', icon: '🔑', category: 'security', description: '身份认证授权', url: '/cam' },
  { id: 'ssl', name: '证书管理', icon: '📜', category: 'security', description: 'SSL证书部署', url: '/ssl' },
  { id: 'waf', name: 'Web防火墙', icon: '🛡️', category: 'security', description: 'DDoS防护', url: '/waf' },
  { id: 'soc', name: '安全运营', icon: '📡', category: 'security', description: '威胁检测响应', url: '/soc' },
  // 研发运维
  { id: 'coding', name: '代码托管', icon: '💻', category: 'devops', description: 'Git仓库服务', url: '/coding' },
  { id: 'pipeline', name: '持续交付', icon: '🔄', category: 'devops', description: 'CI/CD流水线', url: '/pipeline' },
  { id: 'container', name: '容器服务', icon: '📦', category: 'devops', description: 'Kubernetes集群', url: '/container' },
  { id: 'monitor', name: '监控中心', icon: '📈', category: 'devops', description: 'APM性能监控', url: '/monitor' },
  // 业务应用
  { id: 'crm', name: '客户管理', icon: '👥', category: 'business', description: 'CRM客户关系', url: '/crm' },
  { id: 'oa', name: '办公协同', icon: '📝', category: 'business', description: '审批流程', url: '/oa' },
  { id: 'bi', name: '数据分析', icon: '📊', category: 'business', description: 'BI报表平台', url: '/bi' },
  { id: 'form', name: '表单引擎', icon: '📋', category: 'business', description: '可视化表单', url: '/form' },
  { id: 'sms', name: '短信服务', icon: '📱', category: 'business', description: '短信网关', url: '/sms' },
  { id: 'mail', name: '邮件服务', icon: '✉️', category: 'business', description: '企业邮箱', url: '/mail' },
];

const STORAGE_KEY_RECENT = 'product_switcher_recent';
const STORAGE_KEY_FAVORITES = 'product_switcher_favorites';

// ============================================================================
// 主组件
// ============================================================================
interface ProductSwitcherProps {
  children?: React.ReactNode;
}

const ProductSwitcher: React.FC<ProductSwitcherProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSystems, setRecentSystems] = useState<SystemItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  // 加载本地存储数据
  useEffect(() => {
    try {
      const recent = localStorage.getItem(STORAGE_KEY_RECENT);
      if (recent) setRecentSystems(JSON.parse(recent));

      const favorites = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (favorites) setFavoriteIds(new Set(JSON.parse(favorites)));
    } catch {}
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // 记录最近访问
  const recordRecent = useCallback((system: SystemItem) => {
    setRecentSystems(prev => {
      const filtered = prev.filter(s => s.id !== system.id);
      const updated = [system, ...filtered].slice(0, 5);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 切换收藏
  const toggleFavorite = useCallback((systemId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(systemId)) {
        next.delete(systemId);
      } else {
        next.add(systemId);
      }
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // 访问系统
  const handleAccess = useCallback((system: SystemItem, openNewTab: boolean = false) => {
    recordRecent(system);
    if (openNewTab) {
      window.open(system.url, '_blank');
    } else {
      // 实际项目中这里可以触发路由切换
      console.log('切换到系统:', system.name, system.url);
    }
    setIsOpen(false);
  }, [recordRecent]);

  // 模糊搜索过滤
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SYSTEMS;
    const query = searchQuery.toLowerCase();
    return ALL_SYSTEMS.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 按分类分组
  const groupedSystems = useMemo(() => {
    const groups: Record<string, SystemItem[]> = {};
    filteredSystems.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSystems]);

  // 收藏的系统
  const favoriteSystems = useMemo(() => {
    return ALL_SYSTEMS.filter(s => favoriteIds.has(s.id));
  }, [favoriteIds]);

  return (
    <ProductSwitcherContext.Provider value={{ openDrawer, closeDrawer, isOpen, isDark }}>
      {children}

      {/* 遮罩层 */}
      <div
        className={`
          fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* 侧边抽屉 */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full
          w-80 sm:w-96
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDark
            ? 'bg-slate-900/95 border-r border-slate-700/50'
            : 'bg-white/95 border-r border-slate-200/80'
          }
          backdrop-blur-xl
          flex flex-col
          shadow-2xl
        `}
      >
        {/* 头部搜索区 */}
        <div className={`
          p-4 border-b
          ${isDark ? 'border-slate-700/50' : 'border-slate-200'}
        `}>
          {/* 品牌标识 */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-blue-500 to-blue-600
              text-white font-bold text-lg
              shadow-lg shadow-blue-500/30
            `}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                产品中心
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                统一入口 · 快速切换
              </p>
            </div>
            {/* 主题切换 */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`
                ml-auto p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}
              `}
            >
              {isDark ? '🌙' : '☀️'}
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索系统名称..."
              className={`
                w-full h-11 pl-11 pr-4 rounded-xl
                text-sm transition-all duration-200
                ${isDark
                  ? 'bg-slate-800/80 text-white placeholder-slate-500 border border-slate-700 focus:border-blue-500'
                  : 'bg-slate-100/80 text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              `}
            />
            <svg
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
              >
                <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Tab切换 */}
          <div className={`flex gap-2 mt-3`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'all'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              全部产品
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                flex items-center gap-1.5
                ${activeTab === 'favorites'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <span>⭐</span>
              <span>我的收藏</span>
              {favoriteIds.size > 0 && (
                <span className={`
                  ml-1 px-1.5 py-0.5 rounded text-xs
                  ${activeTab === 'favorites' ? 'bg-blue-400' : isDark ? 'bg-slate-700' : 'bg-slate-200'}
                `}>
                  {favoriteIds.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 最近访问 */}
          {!searchQuery && activeTab === 'all' && recentSystems.length > 0 && (
            <section>
              <h3 className={`
                text-xs font-semibold uppercase tracking-wider mb-3
                ${isDark ? 'text-slate-500' : 'text-slate-400'}
              `}>
                最近访问
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {recentSystems.map(system => (
                  <SystemCard
                    key={system.id}
                    system={system}
                    isDark={isDark}
                    isFavorite={favoriteIds.has(system.id)}
                    onAccess={handleAccess}
                    onToggleFavorite={toggleFavorite}
                    compact
                  />
                ))}
              </div>
            </section>
          )}

          {/* 收藏区 */}
          {activeTab === 'favorites' && (
            <section>
              <h3 className={`
                text-xs font-semibold uppercase tracking-wider mb-3
                ${isDark ? 'text-slate-500' : 'text-slate-400'}
              `}>
                我的收藏 ({favoriteSystems.length})
              </h3>
              {favoriteSystems.length === 0 ? (
                <div className={`
                  py-8 text-center rounded-xl
                  ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}
                `}>
                  <div className="text-3xl mb-2">⭐</div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    暂无收藏，快去添加吧
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {favoriteSystems.map(system => (
                    <SystemCard
                      key={system.id}
                      system={system}
                      isDark={isDark}
                      isFavorite={true}
                      onAccess={handleAccess}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 全部分类 */}
          {activeTab === 'all' && (
            <section>
              {searchQuery ? (
                // 搜索结果
                <>
                  <h3 className={`
                    text-xs font-semibold uppercase tracking-wider mb-3
                    ${isDark ? 'text-slate-500' : 'text-slate-400'}
                  `}>
                    搜索结果 ({filteredSystems.length})
                  </h3>
                  {filteredSystems.length === 0 ? (
                    <div className={`
                      py-8 text-center rounded-xl
                      ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}
                    `}>
                      <div className="text-3xl mb-2">🔍</div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        未找到匹配的系统
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredSystems.map(system => (
                        <SystemCard
                          key={system.id}
                          system={system}
                          isDark={isDark}
                          isFavorite={favoriteIds.has(system.id)}
                          onAccess={handleAccess}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // 分类展示
                Object.entries(groupedSystems).map(([categoryId, systems]) => {
                  const category = CATEGORIES.find(c => c.id === categoryId);
                  if (!category) return null;
                  return (
                    <div key={categoryId}>
                      <h3 className={`
                        text-xs font-semibold uppercase tracking-wider mb-3
                        flex items-center gap-2
                        ${isDark ? 'text-slate-500' : 'text-slate-400'}
                      `}>
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                        <span className={`
                          px-1.5 py-0.5 rounded text-xs
                          ${isDark ? 'bg-slate-800' : 'bg-slate-200'}
                        `}>
                          {systems.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {systems.map(system => (
                          <SystemCard
                            key={system.id}
                            system={system}
                            isDark={isDark}
                            isFavorite={favoriteIds.has(system.id)}
                            onAccess={handleAccess}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          )}
        </div>

        {/* 底部 */}
        <div className={`
          p-4 border-t text-center
          ${isDark ? 'border-slate-700/50' : 'border-slate-200'}
        `}>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            天机智信运营管理系统 · 产品切换器
          </p>
        </div>
      </div>
    </ProductSwitcherContext.Provider>
  );
};

// ============================================================================
// 系统卡片组件
// ============================================================================
interface SystemCardProps {
  system: SystemItem;
  isDark: boolean;
  isFavorite: boolean;
  onAccess: (system: SystemItem, newTab?: boolean) => void;
  onToggleFavorite: (id: string) => void;
  compact?: boolean;
}

const SystemCard: React.FC<SystemCardProps> = ({
  system,
  isDark,
  isFavorite,
  onAccess,
  onToggleFavorite,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative
        p-3 rounded-xl cursor-pointer
        transition-all duration-200
        ${isDark
          ? isHovered ? 'bg-slate-800' : 'bg-transparent hover:bg-slate-800/50'
          : isHovered ? 'bg-slate-100' : 'bg-transparent hover:bg-slate-50'
        }
        ${compact ? 'border-b' : isDark ? 'hover:shadow-lg hover:shadow-blue-500/5' : 'hover:shadow-lg hover:shadow-blue-500/10'}
      `}
      onClick={() => onAccess(system)}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-xl
            transition-all duration-200
            ${isHovered ? 'scale-110 shadow-lg' : ''}
            ${isDark
              ? 'bg-slate-800 group-hover:bg-blue-500/20'
              : 'bg-slate-100 group-hover:bg-blue-50'
            }
          `}
        >
          {system.icon}
        </div>

        {/* 文字 */}
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-medium text-sm truncate
            ${isDark ? 'text-white' : 'text-slate-800'}
          `}>
            {system.name}
          </h4>
          {!compact && system.description && (
            <p className={`
              text-xs truncate mt-0.5
              ${isDark ? 'text-slate-500' : 'text-slate-400'}
            `}>
              {system.description}
            </p>
          )}
        </div>
      </div>

      {/* 操作按钮（hover显示） */}
      <div
        className={`
          absolute top-2 right-2
          flex items-center gap-1
          transition-all duration-200
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
        `}
      >
        {/* 收藏按钮 */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(system.id);
          }}
          className={`
            p-1.5 rounded-lg transition-colors
            ${isFavorite
              ? 'text-yellow-500 hover:text-yellow-400'
              : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }
            ${isFavorite ? 'bg-yellow-500/10' : isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}
          `}
          title={isFavorite ? '取消收藏' : '添加收藏'}
        >
          {isFavorite ? '★' : '☆'}
        </button>

        {/* 新标签打开 */}
        <button
          onClick={e => {
            e.stopPropagation();
            onAccess(system, true);
          }}
          className={`
            p-1.5 rounded-lg transition-colors
            ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}
          `}
          title="新标签页打开"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductSwitcher;
