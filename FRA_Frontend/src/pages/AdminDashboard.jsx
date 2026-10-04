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
  MessageSquare,
  Tag,
  Plus,
  X,
  Loader2,
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
  const [moderationReviews, setModerationReviews] = useState([]);
  const [moderationComments, setModerationComments] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states for management tabs
  const [userSearch, setUserSearch] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');

  // Category creation modal
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('cuisine');
  const [newCatIcon, setNewCatIcon] = useState('🍕');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, recipesRes, modRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/recipes?limit=100'),
        api.get('/admin/moderation'),
        api.get('/categories'),
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
      if (modRes.success) {
        setModerationReviews(modRes.reviews || []);
        setModerationComments(modRes.comments || []);
      }
      if (catRes.success) {
        setCategoriesList(catRes.categories || []);
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

  const handleStatusChange = async (recipeId, status) => {
    try {
      const res = await api.patch(`/admin/recipes/${recipeId}/status`, { status });
      if (res.success) {
        showToast(`Recipe status set to "${status}"`, 'success');
        setRecipesList((prev) =>
          prev.map((r) => (r._id === recipeId ? { ...r, status } : r))
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

  // Moderation actions
  const handleDeleteReview = async (recipeId, reviewId) => {
    if (!window.confirm('Delete this user review permanently?')) return;
    try {
      const res = await api.delete(`/admin/reviews/${recipeId}/${reviewId}`);
      if (res.success) {
        showToast('Review removed', 'success');
        setModerationReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteComment = async (recipeId, commentId) => {
    if (!window.confirm('Delete this user comment permanently?')) return;
    try {
      const res = await api.delete(`/admin/comments/${recipeId}/${commentId}`);
      if (res.success) {
        showToast('Comment removed', 'success');
        setModerationComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Category actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Please provide a category name', 'error');
      return;
    }

    try {
      setCreatingCat(true);
      const res = await api.post('/categories', {
        name: newCatName.trim(),
        type: newCatType,
        icon: newCatIcon || '🍽️',
        description: newCatDesc.trim(),
      });

      if (res.success) {
        showToast(`Category "${res.category.name}" added successfully!`, 'success');
        setCategoriesList((prev) => [...prev, res.category]);
        setNewCatName('');
        setNewCatDesc('');
        setShowAddCatModal(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.success) {
        showToast('Category deleted successfully', 'success');
        setCategoriesList((prev) => prev.filter((c) => c._id !== catId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filters
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

  const filteredCategories = categoriesList.filter((cat) => {
    const matchesType = categoryTypeFilter === 'all' || cat.type === categoryTypeFilter;
    const matchesSearch =
      cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(catSearch.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-orange-600" />
            Administrative Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Monitor platform metrics, moderate community recipes, oversee user roles, and manage taxonomy categories.
          </p>
        </div>

        {/* Quick link to create recipe or categories */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setShowAddCatModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
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
              <span className="text-xs font-bold uppercase tracking-wider">Categories & Tags</span>
              <Tag className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{categoriesList.length}</div>
            <span className="text-[11px] text-orange-600 font-semibold">Cuisines, meals, & diets</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
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
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
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
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({usersList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'moderation'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Community Moderation ({moderationReviews.length + moderationComments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'categories'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categories & Tags ({categoriesList.length})</span>
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
                  <th className="p-4">Status</th>
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
                      <select
                        value={recipe.status || 'approved'}
                        onChange={(e) => handleStatusChange(recipe._id, e.target.value)}
                        className={`px-2 py-1 rounded-xl text-[10px] font-bold border cursor-pointer outline-none transition-colors ${
                          recipe.status === 'pending'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : recipe.status === 'rejected'
                            ? 'bg-rose-50 text-rose-900 border-rose-300'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
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

      {/* Tab 4: Content Moderation */}
      {activeTab === 'moderation' && (
        <div className="space-y-8">
          {/* Reviews Moderation Section */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">User Reviews & Star Ratings</h3>
                <p className="text-xs text-stone-500">Inspect and remove inappropriate or abusive recipe reviews</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {moderationReviews.length} Reviews
              </span>
            </div>

            {moderationReviews.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {moderationReviews.map((rev) => (
                  <div key={rev._id} className="py-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={rev.userName}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{rev.userName}</span>
                          <span className="text-amber-500 text-xs font-bold flex items-center">
                            {'★'.repeat(rev.rating)}
                            <span className="text-stone-300">{'★'.repeat(5 - rev.rating)}</span>
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                          "{rev.comment}"
                        </p>
                        <div className="text-[11px] text-stone-500">
                          On recipe:{' '}
                          <Link to={`/recipes/${rev.recipeId}`} className="font-bold text-amber-700 hover:underline">
                            {rev.recipeTitle}
                          </Link>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.recipeId, rev._id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Review</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic py-4 text-center">No reviews found.</p>
            )}
          </div>

          {/* Comments Moderation Section */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Discussion Comments & Questions</h3>
                <p className="text-xs text-stone-500">Moderate community threads and user replies</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                {moderationComments.length} Comments
              </span>
            </div>

            {moderationComments.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {moderationComments.map((comm) => (
                  <div key={comm._id} className="py-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={comm.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={comm.userName}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{comm.userName}</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                          "{comm.text}"
                        </p>
                        <div className="text-[11px] text-stone-500">
                          On recipe:{' '}
                          <Link to={`/recipes/${comm.recipeId}`} className="font-bold text-amber-700 hover:underline">
                            {comm.recipeTitle}
                          </Link>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comm.recipeId, comm._id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Comment</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic py-4 text-center">No comments found.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Categories & Taxonomy Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setCategoryTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTypeFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                All ({categoriesList.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryTypeFilter('cuisine')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTypeFilter === 'cuisine'
                    ? 'bg-white text-orange-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🍕 Cuisines ({categoriesList.filter((c) => c.type === 'cuisine').length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryTypeFilter('mealType')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTypeFilter === 'mealType'
                    ? 'bg-white text-amber-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🥞 Meal Types ({categoriesList.filter((c) => c.type === 'mealType').length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryTypeFilter('dietaryTag')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTypeFilter === 'dietaryTag'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🥦 Dietary Tags ({categoriesList.filter((c) => c.type === 'dietaryTag').length})
              </button>
            </div>

            {/* Search and Add buttons */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Filter categories..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddCatModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-3xl border border-stone-200 p-4 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl p-2 rounded-2xl bg-stone-50 border border-stone-100 shrink-0">
                    {cat.icon || '🍽️'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-stone-900 truncate">{cat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          cat.type === 'cuisine'
                            ? 'bg-orange-100 text-orange-900'
                            : cat.type === 'mealType'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {cat.type}
                      </span>
                      {cat.isDefault && (
                        <span className="text-[9px] text-stone-400 font-semibold">default</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8">
              <Tag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">No categories found matching criteria</p>
              <p className="text-xs text-stone-400 mt-1">Try clearing your search or add a new category.</p>
            </div>
          )}
        </div>
      )}

      {/* Category Creation Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-lg">Add New Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g., Korean, Brunch, Dairy-Free"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Classification *
                  </label>
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium cursor-pointer"
                  >
                    <option value="cuisine">Cuisine</option>
                    <option value="mealType">Meal Type</option>
                    <option value="dietaryTag">Dietary Tag</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Emoji / Icon
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      placeholder="🍕"
                      maxLength={4}
                      className="w-16 text-center text-lg py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <div className="flex gap-1 overflow-x-auto text-base">
                      {['🍲', '🌮', '🥗', '🥑', '🥞', '🍰', '🍜'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewCatIcon(emoji)}
                          className="p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description for recipes in this category..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCat}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {creatingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
