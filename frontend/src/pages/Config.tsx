import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faImage, faUsers, faUserShield, faSave, faPlus, faEdit, faTrash, faCheck, faToggleOn, faToggleOff, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { getConfig, updateConfig, getSystems, addSystem, updateSystem, deleteSystem, getUsers, getRoles, addUser, updateUser, deleteUser, addRole, updateRole, deleteRole, System, User, Role } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

type MenuKey = 'system' | 'logo' | 'users' | 'roles';

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
  const [systemForm, setSystemForm] = useState({ name: '', description: '', url: '', logo: '', enabled: true });

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', roleId: '' });

  // Role form state
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', systemIds: [] as string[] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [configData, systemsData, usersData, rolesData] = await Promise.all([
      getConfig(),
      getSystems(),
      getUsers(),
      getRoles()
    ]);
    setSystemName(configData.systemName || '');
    setLogo(configData.logo || '');
    setSystems(systemsData);
    setUsers(usersData);
    setRoles(rolesData);
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
    setSystemForm({ name: '', description: '', url: '', logo: '', enabled: true });
    setShowSystemForm(true);
  };

  const handleEditSystem = (system: System) => {
    setEditingSystem(system);
    setSystemForm({
      name: system.name,
      description: system.description,
      url: system.url,
      logo: system.logo,
      enabled: system.enabled
    });
    setShowSystemForm(true);
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
    { key: 'system' as MenuKey, icon: faCog, label: '访问系统配置' },
    { key: 'logo' as MenuKey, icon: faImage, label: '系统logo配置' },
    { key: 'users' as MenuKey, icon: faUsers, label: '用户管理' },
    { key: 'roles' as MenuKey, icon: faUserShield, label: '角色管理' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-72px)]">
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">系统名称</label>
                      <input
                        type="text"
                        value={systemForm.name}
                        onChange={e => setSystemForm({ ...systemForm, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入系统名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">系统Logo URL</label>
                      <input
                        type="text"
                        value={systemForm.logo}
                        onChange={e => setSystemForm({ ...systemForm, logo: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入Logo URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">系统描述</label>
                      <input
                        type="text"
                        value={systemForm.description}
                        onChange={e => setSystemForm({ ...systemForm, description: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入系统描述"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">访问URL</label>
                      <input
                        type="text"
                        value={systemForm.url}
                        onChange={e => setSystemForm({ ...systemForm, url: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        placeholder="输入访问URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">启用状态</label>
                      <div className="flex items-center gap-2">
                        <button
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">系统名称</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">描述</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">访问URL</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {systems.map((system) => (
                      <tr key={system.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="text-slate-800 font-medium">{system.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-500 text-sm">{system.description}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 max-w-xs">
                            <span className="text-slate-400 text-xs truncate">{system.url}</span>
                            <a href={system.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex-shrink-0">
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                            </a>
                          </div>
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
        </main>
      </div>
    </div>
  );
}