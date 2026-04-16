import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/Vector.svg';

interface NavbarProps {
  systemName?: string;
}

export default function Navbar({ systemName = '运营管理系统' }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <>
              <div className="flex items-center gap-2 text-white/80">
                <FontAwesomeIcon icon={faUser} className="text-sm" />
                <span className="font-medium">{user.username}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'bg-slate-500/30 text-slate-300'
                }`}>
                  {user.role === 'admin' ? '管理员' : '用户'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                退出
              </button>
            </>
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