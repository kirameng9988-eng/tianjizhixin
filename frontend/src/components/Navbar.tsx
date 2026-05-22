import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSignOutAlt, faBuilding, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/Vector.svg';

interface NavbarProps {
  systemName?: string;
  currentSystem?: string;
  onMenuClick?: () => void;
}

export default function Navbar({ systemName = '运营管理系统', currentSystem, onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="relative z-10 border-b border-white/10 h-14 bg-[#030714]">
      <div className="h-full flex items-center">
        {/* Left: Menu button and Logo */}
        <div className="flex items-center gap-3 pl-4">
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
            title="打开产品导航"
          >
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-white/80 rounded-full" />
              <span className="w-full h-0.5 bg-white/80 rounded-full" />
              <span className="w-full h-0.5 bg-white/80 rounded-full" />
            </div>
          </button>
          <img src={Logo} alt="logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-white tracking-tight">运营管理系统</h1>
        </div>

        {/* Center: Menu with 40px gap from logo */}
        <div className="flex items-center gap-10 ml-10">
          <Link to="/" className="text-white/90 hover:text-white font-medium transition-colors">
            首页
          </Link>
          {currentSystem && (
            <Link
              to="/service-console"
              className="text-white font-medium border-b-2 border-blue-500 pb-1"
            >
              {currentSystem}
            </Link>
          )}
          <Link to="/config" className="text-white/50 hover:text-white font-medium transition-colors">
            配置管理
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right: User account area */}
        <div className="flex items-center gap-4 pr-6" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                {/* Circular avatar with blue gradient */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A61FF] to-[#0A8AFF] flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white text-sm font-semibold">{getInitial(user.username)}</span>
                </div>
                <span className="text-white font-medium hidden sm:block">{user.username}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-white/60 text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-4 top-full mt-2 w-80 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A61FF] to-[#0A8AFF] flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-white text-lg font-semibold">{getInitial(user.username)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 font-semibold text-base truncate">{user.username}</p>
                        <p className="text-slate-500 text-sm truncate">{user.email || '用户账号'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {/* Enterprise info */}
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-sm" />
                        </div>
                        <div>
                          <p className="text-slate-700 text-sm font-medium">企业基本信息</p>
                          <p className="text-slate-400 text-xs">天机智信科技有限公司</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal info */}
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="text-emerald-500 text-sm" />
                        </div>
                        <div>
                          <p className="text-slate-700 text-sm font-medium">个人基本信息</p>
                          <p className="text-slate-400 text-xs">角色: {user.role || '管理员'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Logout */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                      <span className="text-sm font-medium">退出登录</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-[#0A61FF] hover:bg-[#0A8AFF] rounded-lg text-white transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}