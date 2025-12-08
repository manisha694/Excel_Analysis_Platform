import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

function Admin() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [usersRes, usageRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/usage'),
        ]);
        setUsers(usersRes.data);
        setUsage(usageRes.data);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <span>👑</span>
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-gray-600 text-lg">Manage users and monitor platform usage</p>
      </div>

      {/* Usage Statistics */}
      {usage && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-slide-down">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>📊</span>
            <span>Usage Statistics</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">👥</span>
                <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold">
                  Users
                </span>
              </div>
              <p className="text-4xl font-bold text-blue-700">{usage.totalUsers}</p>
              <p className="text-sm text-blue-600 mt-1">Total registered users</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">📁</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                  Files
                </span>
              </div>
              <p className="text-4xl font-bold text-green-700">{usage.totalFiles}</p>
              <p className="text-sm text-green-600 mt-1">Total uploaded files</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">📈</span>
                <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-semibold">
                  Analyses
                </span>
              </div>
              <p className="text-4xl font-bold text-purple-700">{usage.totalAnalyses}</p>
              <p className="text-sm text-purple-600 mt-1">Total chart analyses</p>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>👥</span>
            <span>Users Management</span>
          </h2>
          {users.length > 0 && (
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {users.length} {users.length === 1 ? 'user' : 'users'}
            </span>
          )}
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-xl text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50 transition transform hover:scale-[1.01]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-sm mr-3">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Files Per User */}
      {usage && usage.filesPerUser && usage.filesPerUser.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>📊</span>
            <span>Files Per User</span>
          </h2>
          <div className="space-y-3">
            {usage.filesPerUser.map((item, index) => (
              <div
                key={item.userId}
                className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all transform hover:scale-[1.02] hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                    {item.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{item.userName}</p>
                    <p className="text-sm text-gray-500">{item.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {item.fileCount}
                  </span>
                  <span className="text-gray-600 font-medium">
                    {item.fileCount === 1 ? 'file' : 'files'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
