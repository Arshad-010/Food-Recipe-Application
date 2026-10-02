import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Utensils,
  Star,
  Sparkles,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  BarChart3,
  UserCheck,
  UserX,
  Award,
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [cuisineDist, setCuisineDist] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [recipesList, setRecipesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states for management tabs
  const [userSearch, setUserSearch] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, recipesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/recipes?limit=50'),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setCuisineDist(statsRes.cuisineDistribution || []);
        setRecentRecipes(statsRes.recentRecipes || []);
      }
      if (usersRes.success) {
        setUsersList(usersRes.users || []);
      }
      if (recipesRes.success) {
        setRecipesList(recipesRes.recipes || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Recipe actions
  const handleToggleFeature = async (recipeId) => {
    try {
      const res = await api.patch(`/admin/recipes/${recipeId}/feature`);
      if (res.success) {
        showToast(res.message, 'success');
        setRecipesList((prev) =>
          prev.map((r) => (r._id === recipeId ? { ...r, isFeatured: res.isFeatured } : r))
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe permanently as Admin?')) return;
    try {
      const res = await api.delete(`/admin/recipes/${recipeId}`);
      if (res.success) {
        showToast('Recipe deleted by administrator', 'success');
        setRecipesList((prev) => prev.filter((r) => r._id !== recipeId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // User actions
  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of this user to "${nextRole}"?`)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      if (res.success) {
        showToast(res.message, 'success');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleBlockUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/block`);
      if (res.success) {
        showToast(res.message, 'success');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.isBlocked } : u))
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete user and all their published recipes permanently?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.success) {
        showToast('User deleted', 'success');
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredRecipes = recipesList.filter(
    (r) =>
      r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      r.author?.name?.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold mb-2">
          <Shield className="w-3.5 h-3.5 text-orange-600" />
          Administrative Control Center
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Monitor platform metrics, manage user permissions, and moderate community recipes.
        </p>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Recipes</span>
              <Utensils className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{stats.totalRecipes}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">{stats.publishedRecipes} published</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{stats.totalUsers}</div>
            <span className="text-[11px] text-stone-400 font-semibold">Active community members</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Reviews & Ratings</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{stats.totalReviews}</div>
            <span className="text-[11px] text-amber-700 font-semibold">★ {stats.avgRating} average platform rating</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Featured Dishes</span>
              <Sparkles className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{stats.featuredRecipes}</div>
            <span className="text-[11px] text-orange-600 font-semibold">Promoted on homepage</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 space-x-2 sm:space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipes')}
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'recipes'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Recipe Moderation ({recipesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({usersList.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cuisine Distribution Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-stone-900">Recipes per Cuisine Category</h3>
            <div className="space-y-3 pt-2">
              {cuisineDist.map((item) => {
                const max = Math.max(...cuisineDist.map((c) => c.count), 1);
                const percent = Math.round((item.count / max) * 100);
                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span>{item._id}</span>
                      <span>{item.count} recipes</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Recent Dishes */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-stone-900">Recent Platform Recipes</h3>
            <div className="divide-y divide-stone-100">
              {recentRecipes.map((r) => (
                <div key={r._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={r.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                      alt={r.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-stone-900 truncate">{r.title}</p>
                      <p className="text-[11px] text-stone-500">{r.cuisine} • By {r.author?.name || 'Chef'}</p>
                    </div>
                  </div>
                  <Link
                    to={`/recipes/${r._id}`}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 shrink-0"
                  >
                    Inspect &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Recipe Moderation */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
              placeholder="Search recipes by title, cuisine or chef..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Dish</th>
                  <th className="p-4">Cuisine</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                          alt={recipe.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{recipe.title}</p>
                          <span className="text-[10px] text-stone-400">{recipe.difficulty}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-stone-700">{recipe.cuisine}</td>
                    <td className="p-4 text-stone-600">{recipe.author?.name || recipe.authorName || 'Chef'}</td>
                    <td className="p-4 font-bold text-amber-700">★ {recipe.averageRating?.toFixed(1) || '5.0'}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(recipe._id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                          recipe.isFeatured
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {recipe.isFeatured ? '★ Featured' : 'Normal'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/recipes/${recipe._id}`}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-stone-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecipe(recipe._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title="Delete Recipe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <span className="font-bold text-stone-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-orange-100 text-orange-900 border-orange-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isBlocked
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.isBlocked ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleUserRole(u._id, u.role)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                          title="Toggle Role"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBlockUser(u._id)}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            u.isBlocked
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={u.isBlocked ? 'Unblock User' : 'Suspend User'}
                        >
                          {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
