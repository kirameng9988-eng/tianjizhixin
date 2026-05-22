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

        {/* Center: Menu */}
        <div className="flex items-center gap-8 ml-12">
          <Link to="/" className="text-white/90 hover:text-white font-medium transition-colors">
            首页
          </Link>
          {currentSystem && (
            <span className="text-white font-medium">
              数据服务系统
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right: Config + User account */}
        <div className="flex items-center gap-4 pr-6" ref={dropdownRef}>
          <Link to="/config" className="text-white/70 hover:text-white font-medium transition-colors">
            配置管理
          </Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A61FF] to-[#0A8AFF] flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{getInitial(user.username)}</span>
                </div>
                <span className="text-white text-sm font-medium">{user.username}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-white/60 text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-4 top-full mt-2 w-72 bg-white rounded-xl border border-slate-100 overflow-hidden z-50">
                  {/* Header - User info horizontal compact */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A61FF] to-[#0A8AFF] flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{getInitial(user.username)}</span>
                      </div>
                      <span className="text-slate-700 text-sm font-medium">管理账号</span>
                      <span className="text-slate-400 text-sm">（{user.username}）</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <div className="px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                        <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-xs" />
                      </div>
                      <span className="text-slate-600 text-sm">企业基本信息</span>
                    </div>

                    <div className="px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-emerald-500 text-xs" />
                      </div>
                      <span className="text-slate-600 text-sm">个人基本信息</span>
                    </div>
                  </div>

                  {/* Footer - Logout */}
                  <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                      <span className="text-sm font-medium">退出登录</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-[#0A61FF] hover:bg-[#0A8AFF] rounded-lg text-white transition-all text-sm font-medium"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}