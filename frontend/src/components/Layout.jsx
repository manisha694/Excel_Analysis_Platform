import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📊 Excel Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Data Visualization Platform</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard')
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transform scale-105'
                : 'hover:bg-gray-700 hover:transform hover:scale-105'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="font-medium">Dashboard</span>
          </Link>
          
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive('/admin')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg transform scale-105'
                  : 'hover:bg-gray-700 hover:transform hover:scale-105'
              }`}
            >
              <span className="text-xl">👑</span>
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="mb-4 p-3 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <span className="inline-block px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
