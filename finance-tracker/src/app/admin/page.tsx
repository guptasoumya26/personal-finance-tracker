'use client';

import { useState, useEffect } from 'react';
import { Users, UserX, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');

      if (response.status === 403) {
        setError('Admin access required');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingUser(userId);
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Failed to delete user');
    } finally {
      setProcessingUser(null);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      setProcessingUser(userId);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, status: newStatus as 'active' | 'inactive' } : user
        ));
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Update user status error:', error);
      alert('Failed to update user status');
    } finally {
      setProcessingUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error === 'Admin access required') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && error !== 'Admin access required' && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        {!isLoading && !error && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                Users ({users.length}/5)
              </h2>
            </div>

            {users.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-900 text-purple-200'
                              : 'bg-blue-900 text-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-red-900 text-red-200'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.last_login ? formatDate(user.last_login) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {/* Toggle Status Button */}
                            <button
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              disabled={processingUser === user.id}
                              className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                              title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.status === 'active' ? (
                                <ToggleRight className="h-5 w-5" />
                              ) : (
                                <ToggleLeft className="h-5 w-5" />
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => deleteUser(user.id, user.username)}
                              disabled={processingUser === user.id}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              {processingUser === user.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <UserX className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {users.filter(u => u.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-400">Inactive Users</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {5 - users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">Available Slots</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}