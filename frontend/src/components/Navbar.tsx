import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/Vector.svg';

interface NavbarProps {
  systemName?: string;
}

export default function Navbar({ systemName = '运营管理系统' }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="relative z-10 border-b border-white/10 h-[72px] bg-[#030714]">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-white tracking-tight">{systemName}</h1>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-white/90 hover:text-white font-medium transition-colors">
            首页
          </Link>
          <Link to="/config" className="text-white/50 hover:text-white font-medium transition-colors">
            配置管理
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0A61FF] flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{getInitial(user.username)}</span>
                </div>
                <span className="text-white font-medium">{user.username}</span>
                <FontAwesomeIcon icon={faChevronDown} className="text-white/60 text-xs" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all text-sm"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}