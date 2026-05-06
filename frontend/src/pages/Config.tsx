import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faImage, faUsers, faUserShield, faSave, faPlus, faEdit, faTrash, faCheck, faToggleOn, faToggleOff, faEye, faTimes, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { getConfig, updateConfig, getSystems, addSystem, updateSystem, deleteSystem, getUsers, getRoles, addUser, updateUser, deleteUser, addRole, updateRole, deleteRole, getPendingApplications, updateApplication, System, User, Role, Application, SYSTEM_CATEGORIES, SystemType, SystemArea } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

type MenuKey = 'system' | 'logo' | 'users' | 'roles' | 'applications';

export default function Config() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<MenuKey>('system');
  const [systemName, setSystemName] = useState('');
  const [logo, setLogo] = useState('');
  const [systems, setSystems] = useState<System[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // System form state
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [systemForm, setSystemForm] = useState({
    name: '',
    type: 'external' as SystemType,
    sort: 0,
    area: 'government' as SystemArea,
    category: 'other',
    urlGov: '',
    urlInternet: '',
    description: '',
    logo: '',
    enabled: true
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSystem, setDetailSystem] = useState<System | null>(null);

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', roleId: '' });

  // Role form state
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', systemIds: [] as string[] });

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationTab, setApplicationTab] = useState<'pending' | 'processed'>('pending');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingApp, setProcessingApp] = useState<Application | null>(null);
  const [processNote, setProcessNote] = useState('');
  const [processStatus, setProcessStatus] = useState<'approved' | 'rejected'>('approved');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [configData, systemsData, usersData, rolesData, pendingAppsData] = await Promise.all([
      getConfig(),
      getSystems(),
      getUsers(),
      getRoles(),
      getPendingApplications()
    ]);
    setSystemName(configData.systemName || '');
    setLogo(configData.logo || '');
    setSystems(systemsData);
    setUsers(usersData);
    setRoles(rolesData);
    setApplications(pendingAppsData);
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    await updateConfig({ systemName, logo });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // System handlers
  const handleAddSystem = () => {
    setEditingSystem(null);
    setSystemForm({
      name: '',
      type: 'external',
      sort: systems.length,
      area: 'government',
      category: 'other',
      urlGov: '',
      urlInternet: '',
      description: '',
      logo: '',
      enabled: true
    });
    setShowSystemForm(true);
  };

  const handleEditSystem = (system: System) => {
    setEditingSystem(system);
    setSystemForm({
      name: system.name,
      type: system.type,
      sort: system.sort,
      area: system.area,
      category: system.category,
      urlGov: system.urlGov,
      urlInternet: system.urlInternet,
      description: system.description,
      logo: system.logo || '',
      enabled: system.enabled
    });
    setShowSystemForm(true);
  };

  const handleViewSystem = (system: System) => {
    setDetailSystem(system);
    setShowDetailModal(true);
  };

  const handleSaveSystem = async () => {
    if (editingSystem) {
      await updateSystem(editingSystem.id, systemForm);
    } else {
      await addSystem(systemForm);
    }
    setShowSystemForm(false);
    setEditingSystem(null);
    loadData();
  };

  const handleDeleteSystem = async (id: string) => {
    if (confirm('确定要删除该子系统吗？此操作不可撤销。')) {
      await deleteSystem(id);
      loadData();
    }
  };

  const handleToggleSystem = async (system: System) => {
    await updateSystem(system.id, { enabled: !system.enabled });
    loadData();
  };

  // User handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', password: '', roleId: roles[0]?.id || '' });
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ username: user.username, password: '', roleId: user.roleId });
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      await updateUser(editingUser.id, { username: userForm.username, roleId: userForm.roleId });
    } else {
      await addUser(userForm);
    }
    setShowUserForm(false);
    loadData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('确定要删除该用户吗？')) {
      await deleteUser(id);
      loadData();
    }
  };

  // Role handlers
  const handleAddRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', systemIds: [] });
    setShowRoleForm(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, systemIds: [...role.systemIds] });
    setShowRoleForm(true);
  };

  const handleSaveRole = async () => {
    if (editingRole) {
      await updateRole(editingRole.id, roleForm);
    } else {
      await addRole(roleForm);
    }
    setShowRoleForm(false);
    loadData();
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm('确定要删除该角色吗？')) {
      await deleteRole(id);
      loadData();
    }
  };

  const toggleSystemForRole = (systemId: string) => {
    if (roleForm.systemIds.includes(systemId)) {
      setRoleForm({ ...roleForm, systemIds: roleForm.systemIds.filter(id => id !== systemId) });
    } else {
      setRoleForm({ ...roleForm, systemIds: [...roleForm.systemIds, systemId] });
    }
  };

  // Application handlers
  const handleProcessApplication = (app: Application) => {
    setProcessingApp(app);
    setProcessNote('');
    setProcessStatus('approved');
    setShowProcessModal(true);
  };

  const handleSubmitProcess = async () => {
    if (!processingApp) return;
    await updateApplication(processingApp.id, {
      status: processStatus,
      processNote
    });
    setShowProcessModal(false);
    setProcessingApp(null);
    loadData();
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

  const menus = [
    { key: 'applications' as MenuKey, icon: faFileAlt, label: '运营系统申请' },
    { key: 'system' as MenuKey, icon: faCog, label: '访问系统配置' },
    { key: 'logo' as MenuKey, icon: faImage, label: '系统logo配置' },
    { key: 'users' as MenuKey, icon: faUsers, label: '用户管理' },
    { key: 'roles' as MenuKey, icon: faUserShield, label: '角色管理' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Left Sidebar */}
        <aside className="w-48 bg-white border-r border-slate-200 py-6 flex-shrink-0">
          <div className="px-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">配置管理</h2>
          </div>
          <nav className="space-y-1">
            {menus.map(menu => (
              <button
                key={menu.key}
                onClick={() => setActiveMenu(menu.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeMenu === menu.key
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={menu.icon} className="text-sm w-5" />
                {menu.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-auto">
          {/* System List */}
          {activeMenu === 'system' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">子系统列表</h3>
                {!showSystemForm && (
                  <button
                    onClick={handleAddSystem}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-all text-sm"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    添加子系统
                  </button>
                )}
              </div>

              {showSystemForm && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={editingSystem ? faEdit : faPlus} className="text-blue-500 text-sm" />
                    {editingSystem ? '编辑子系统' : '添加新子系统'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">工具名称</label>
                      <input
                        type="text"
                        value={systemForm.name}
                        onChange={e => setSystemForm({ ...systemForm, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入工具名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">工具类型</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSystemForm({ ...systemForm, type: 'internal' })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            systemForm.type === 'internal'
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          内部工具
                        </button>
                        <button
                          type="button"
                          onClick={() => setSystemForm({ ...systemForm, type: 'external' })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            systemForm.type === 'external'
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          外部工具
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">排序</label>
                      <input
                        type="number"
                        value={systemForm.sort}
                        onChange={e => setSystemForm({ ...systemForm, sort: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="数字越小越靠前"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">所属区域</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSystemForm({ ...systemForm, area: 'government' })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            systemForm.area === 'government'
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          政务网
                        </button>
                        <button
                          type="button"
                          onClick={() => setSystemForm({ ...systemForm, area: 'internet' })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            systemForm.area === 'internet'
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          互联网
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">工具分类</label>
                      <select
                        value={systemForm.category}
                        onChange={e => setSystemForm({ ...systemForm, category: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                      >
                        {SYSTEM_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">工具Logo URL</label>
                      <input
                        type="text"
                        value={systemForm.logo}
                        onChange={e => setSystemForm({ ...systemForm, logo: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入Logo URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">政务网链接</label>
                      <input
                        type="text"
                        value={systemForm.urlGov}
                        onChange={e => setSystemForm({ ...systemForm, urlGov: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入政务网链接"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">互联网链接</label>
                      <input
                        type="text"
                        value={systemForm.urlInternet}
                        onChange={e => setSystemForm({ ...systemForm, urlInternet: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入互联网链接"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">工具描述</label>
                      <textarea
                        value={systemForm.description}
                        onChange={e => setSystemForm({ ...systemForm, description: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入工具描述"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">状态启停</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSystemForm({ ...systemForm, enabled: true })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            systemForm.enabled
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          启用
                        </button>
                        <button
                          type="button"
                          onClick={() => setSystemForm({ ...systemForm, enabled: false })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            !systemForm.enabled
                              ? 'bg-slate-100 border-slate-300 text-slate-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          禁用
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handleSaveSystem}
                      className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => { setShowSystemForm(false); setEditingSystem(null); }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">排序</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">工具名称</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">工具类型</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">所属区域</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">工具分类</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {systems
                      .slice()
                      .sort((a, b) => a.sort - b.sort)
                      .map((system) => (
                      <tr key={system.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="text-slate-400 text-sm">{system.sort}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-800 font-medium">{system.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            system.type === 'internal'
                              ? 'bg-purple-50 text-purple-600 border border-purple-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {system.type === 'internal' ? '内部工具' : '外部工具'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            system.area === 'government'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                          }`}>
                            {system.area === 'government' ? '政务网' : '互联网'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-600 text-sm">
                            {SYSTEM_CATEGORIES.find(c => c.value === system.category)?.label || system.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            system.enabled
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${system.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {system.enabled ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewSystem(system)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all"
                              title="查看详情"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleToggleSystem(system)}
                              className={`p-2 rounded-lg transition-all ${
                                system.enabled
                                  ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
                              }`}
                              title={system.enabled ? '禁用' : '启用'}
                            >
                              <FontAwesomeIcon icon={system.enabled ? faToggleOn : faToggleOff} className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleEditSystem(system)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                              title="编辑"
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteSystem(system.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                              title="删除"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {systems.length === 0 && (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faCog} className="text-slate-300 text-3xl mb-3" />
                    <p className="text-slate-500">暂无子系统</p>
                    <p className="text-slate-400 text-sm mt-1">点击上方按钮添加第一个子系统</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logo Config */}
          {activeMenu === 'logo' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">系统基础配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">系统名称</label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={e => setSystemName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="输入系统名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={logo}
                    onChange={e => setLogo(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="输入 Logo URL"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleSaveConfig}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all text-sm"
                >
                  <FontAwesomeIcon icon={faSave} className="text-xs" />
                  保存配置
                </button>
                {saveSuccess && (
                  <span className="inline-flex items-center gap-2 text-emerald-600 text-sm">
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    保存成功
                  </span>
                )}
              </div>
            </div>
          )}

          {/* User Management */}
          {activeMenu === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">用户管理</h3>
                {!showUserForm && (
                  <button
                    onClick={handleAddUser}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-all text-sm"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    添加用户
                  </button>
                )}
              </div>

              {showUserForm && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-slate-800 font-semibold mb-4 text-sm">{editingUser ? '编辑用户' : '添加用户'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入用户名"
                      />
                    </div>
                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                          placeholder="输入密码"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">角色</label>
                      <select
                        value={userForm.roleId}
                        onChange={e => setUserForm({ ...userForm, roleId: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                      >
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handleSaveUser}
                      className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setShowUserForm(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">用户名</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">角色</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-800 font-medium">{u.username}</td>
                        <td className="px-4 py-3 text-slate-500">{roles.find(r => r.id === u.roleId)?.name || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleEditUser(u)} className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100">
                              <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-500">暂无用户</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role Management */}
          {activeMenu === 'roles' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">角色管理</h3>
                {!showRoleForm && (
                  <button
                    onClick={handleAddRole}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-all text-sm"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    添加角色
                  </button>
                )}
              </div>

              {showRoleForm && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-slate-800 font-semibold mb-4 text-sm">{editingRole ? '编辑角色' : '添加角色'}</h4>
                  <div className="space-y-4">
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-slate-700 mb-2">角色名称</label>
                      <input
                        type="text"
                        value={roleForm.name}
                        onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入角色名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">可访问系统</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {systems.map(system => (
                          <label key={system.id} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50">
                            <input
                              type="checkbox"
                              checked={roleForm.systemIds.includes(system.id)}
                              onChange={() => toggleSystemForRole(system.id)}
                              className="w-4 h-4 text-blue-500 rounded"
                            />
                            <span className="text-slate-700 text-sm">{system.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handleSaveRole}
                      className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setShowRoleForm(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">角色名称</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">可访问系统</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roles.map(role => (
                      <tr key={role.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-800 font-medium">{role.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {role.systemIds.map(id => {
                              const system = systems.find(s => s.id === id);
                              return system ? (
                                <span key={id} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">{system.name}</span>
                              ) : null;
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleEditRole(role)} className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100">
                              <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>
                            <button onClick={() => handleDeleteRole(role.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {roles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-500">暂无角色</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applications Management */}
          {activeMenu === 'applications' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">运营系统申请</h3>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setApplicationTab('pending')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    applicationTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  待处理 ({applications.filter(a => a.status === 'pending').length})
                </button>
                <button
                  onClick={() => setApplicationTab('processed')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    applicationTab === 'processed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  已处理 ({applications.filter(a => a.status !== 'pending').length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">申请人</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">申请系统</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">申请原因</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">申请时间</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicationTab === 'pending' ? (
                      applications.filter(a => a.status === 'pending').length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <FontAwesomeIcon icon={faFileAlt} className="text-slate-300 text-3xl mb-3" />
                            <p className="text-slate-500">暂无待处理的申请</p>
                          </td>
                        </tr>
                      ) : (
                        applications.filter(a => a.status === 'pending').map(app => (
                          <tr key={app.id} className="hover:bg-slate-50">
                            <td className="px-4 py-4">
                              <span className="font-medium text-slate-800">{app.username}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-slate-600">{app.systemName}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-slate-500 text-sm max-w-xs truncate">{app.reason}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-slate-400 text-sm">
                                {new Date(app.applyTime).toLocaleString('zh-CN')}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleProcessApplication(app)}
                                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  处理
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      applications.filter(a => a.status !== 'pending').length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <FontAwesomeIcon icon={faFileAlt} className="text-slate-300 text-3xl mb-3" />
                            <p className="text-slate-500">暂无已处理的申请</p>
                          </td>
                        </tr>
                      ) : (
                        applications.filter(a => a.status !== 'pending').map(app => (
                          <tr key={app.id} className="hover:bg-slate-50">
                            <td className="px-4 py-4">
                              <span className="font-medium text-slate-800">{app.username}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-slate-600">{app.systemName}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-slate-500 text-sm max-w-xs truncate">{app.reason}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-sm ${app.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {app.status === 'approved' ? '已通过' : '已拒绝'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-slate-400 text-sm">
                                {app.processTime ? new Date(app.processTime).toLocaleString('zh-CN') : '-'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && detailSystem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">工具详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">工具名称</label>
                  <p className="text-slate-800">{detailSystem.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">工具类型</label>
                  <p className="text-slate-800">{detailSystem.type === 'internal' ? '内部工具' : '外部工具'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">所属区域</label>
                  <p className="text-slate-800">{detailSystem.area === 'government' ? '政务网' : '互联网'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">工具分类</label>
                  <p className="text-slate-800">{SYSTEM_CATEGORIES.find(c => c.value === detailSystem.category)?.label || detailSystem.category}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">排序</label>
                  <p className="text-slate-800">{detailSystem.sort}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">状态</label>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    detailSystem.enabled
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${detailSystem.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {detailSystem.enabled ? '启用' : '禁用'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">政务网链接</label>
                <p className="text-slate-800 text-sm break-all">{detailSystem.urlGov || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">互联网链接</label>
                <p className="text-slate-800 text-sm break-all">{detailSystem.urlInternet || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">工具描述</label>
                <p className="text-slate-800 text-sm">{detailSystem.description || '-'}</p>
              </div>
              {detailSystem.logo && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Logo</label>
                  <p className="text-slate-800 text-sm break-all">{detailSystem.logo}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Application Modal */}
      {showProcessModal && processingApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProcessModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">处理申请</h3>
              <button
                onClick={() => setShowProcessModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">申请人：</span>
                    <span className="text-slate-800 font-medium">{processingApp.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">申请系统：</span>
                    <span className="text-slate-800 font-medium">{processingApp.systemName}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-slate-500 text-sm">申请原因：</span>
                  <p className="text-slate-800 text-sm mt-1">{processingApp.reason}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">处理结果</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setProcessStatus('approved')}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      processStatus === 'approved'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-1" />
                    已通过
                  </button>
                  <button
                    onClick={() => setProcessStatus('rejected')}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      processStatus === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-1" />
                    未通过
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">处理说明</label>
                <textarea
                  value={processNote}
                  onChange={e => setProcessNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  placeholder="请输入处理说明..."
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowProcessModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSubmitProcess}
                className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${
                  processStatus === 'approved'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                确认{processStatus === 'approved' ? '通过' : '拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}