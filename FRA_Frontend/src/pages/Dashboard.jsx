import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import RecipeCard from '../components/RecipeCard';
import {
  ChefHat,
  Search,
  Compass,
  Heart,
  Utensils,
  Grid,
  User,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  TrendingUp,
  Clock,
  Flame,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Shield,
  Coffee,
  Sun,
  Moon,
  Bookmark,
  ShoppingBag,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Navigation / active section
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search input in header/hero
  const [searchInput, setSearchInput] = useState('');

  // Data states
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [categories, setCategories] = useState([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun, color: 'text-amber-500' };
    if (hour < 18) return { text: 'Good afternoon', icon: Coffee, color: 'text-orange-500' };
    return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Preset categories for quick filtering
  const standardCategories = [
    { name: 'Breakfast', emoji: '🍳', tag: 'Breakfast', bg: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200' },
    { name: 'Lunch', emoji: '🥪', tag: 'Lunch', bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200' },
    { name: 'Dinner', emoji: '🍲', tag: 'Dinner', bg: 'bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-200' },
    { name: 'Desserts', emoji: '🍰', tag: 'Desserts', bg: 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200' },
    { name: 'Vegetarian', emoji: '🥗', tag: 'Vegetarian', bg: 'bg-green-50 hover:bg-green-100 text-green-900 border-green-200' },
    { name: 'Non-Vegetarian', emoji: '🍗', tag: 'Non-Vegetarian', bg: 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200' },
    { name: 'Healthy', emoji: '🥑', tag: 'Healthy', bg: 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200' },
    { name: 'Quick Meals', emoji: '⚡', tag: 'Quick Meals', bg: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border-yellow-200' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load recently viewed from localStorage safely
      try {
        const cachedRecent = JSON.parse(localStorage.getItem('recipehaven_recently_viewed') || '[]');
        if (Array.isArray(cachedRecent)) {
          setRecentlyViewed(cachedRecent.slice(0, 4));
        }
      } catch (storageErr) {
        console.warn('Could not read recently viewed:', storageErr);
      }

      // Parallel API calls with centralized client
      const [popularRes, recsRes, collectionsRes, catRes] = await Promise.allSettled([
        api.get('/recipes?limit=4&sort=popular'),
        api.get('/recipes/recommendations'),
        api.get('/recipes/my/collections'),
        api.get('/categories'),
      ]);

      // Popular recipes
      if (popularRes.status === 'fulfilled' && popularRes.value?.success) {
        const list = popularRes.value.recipes || [];
        list.sort((a, b) => {
          const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
          const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
          if (hasA && !hasB) return -1;
          if (!hasA && hasB) return 1;
          return 0;
        });
        setPopularRecipes(list);
      }

      // Recommended recipes
      if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
        const list = recsRes.value.recommendations || [];
        list.sort((a, b) => {
          const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
          const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
          if (hasA && !hasB) return -1;
          if (!hasA && hasB) return 1;
          return 0;
        });
        setRecommendedRecipes(list);
      }

      // User favorites
      if (collectionsRes.status === 'fulfilled' && collectionsRes.value?.success) {
        setFavoriteRecipes(collectionsRes.value.favorites || []);
      }

      // Categories
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.categories || []);
      }

      // If all essential requests failed, show error
      if (
        popularRes.status === 'rejected' &&
        recsRes.status === 'rejected' &&
        collectionsRes.status === 'rejected'
      ) {
        throw new Error('Unable to connect to the server. Please try again.');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/recipes');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
    navigate('/login');
  };

  const handleFavoriteToggle = (recipeId, isFav) => {
    if (!isFav) {
      setFavoriteRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    }
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-3 space-y-3 animate-pulse">
      <div className="w-full aspect-[4/3] bg-stone-200 rounded-2xl" />
      <div className="space-y-2 p-1">
        <div className="h-4 bg-stone-200 rounded-md w-3/4" />
        <div className="flex gap-2">
          <div className="h-3 bg-stone-100 rounded-md w-1/4" />
          <div className="h-3 bg-stone-100 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col">
      {/* Mobile Sidebar Quick Opener */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pt-3 w-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-2xs hover:bg-stone-50 transition-colors"
          aria-label="Toggle Dashboard Menu"
        >
          <Menu className="w-4 h-4 text-amber-600" />
          <span>Dashboard Menu</span>
        </button>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex gap-8">
        {/* 2. Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 gap-6">
          <nav className="bg-white rounded-3xl border border-stone-200/80 p-3 space-y-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/25'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <Link
              to="/recipes"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <Compass className="w-4 h-4 text-stone-400" />
              <span>Discover Recipes</span>
            </Link>

            <Link
              to="/favorites"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Favorites</span>
              {favoriteRecipes.length > 0 && (
                <span className="ml-auto bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {favoriteRecipes.length}
                </span>
              )}
            </Link>

            <Link
              to="/favorites?tab=myRecipes"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>My Recipes</span>
            </Link>

            <Link
              to="/recipes"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Categories</span>
            </Link>

            <div className="pt-2 border-t border-stone-100 my-1">
              <Link
                to="/profile"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                <User className="w-4 h-4 text-stone-400" />
                <span>Profile</span>
              </Link>

              <Link
                to="/profile"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                <Settings className="w-4 h-4 text-stone-400" />
                <span>Settings</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all mt-1"
                >
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Quick Culinary Tip card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-md shadow-orange-500/15 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Daily Kitchen Tip
            </span>
            <h4 className="font-extrabold text-sm">Rest your meat!</h4>
            <p className="text-xs text-amber-50/90 leading-relaxed">
              Always allow cooked proteins to rest for 5–10 minutes so juices redistribute evenly before slicing.
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-amber-600" />
                    <span className="font-extrabold text-stone-900">Navigation</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm bg-amber-50 text-amber-800"
                  >
                    <Grid className="w-4 h-4 text-amber-600" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/recipes"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Discover Recipes</span>
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Favorites</span>
                  </Link>
                  <Link
                    to="/favorites?tab=myRecipes"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>My Recipes</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile & Preferences</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-orange-700 bg-orange-50"
                    >
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                </nav>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-rose-600 bg-rose-50 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Dashboard Main Content Area */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Error Banner with Retry */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchDashboardData}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Section 1: Welcome Banner & Hero Search */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 sm:p-8 shadow-lg shadow-orange-500/15">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold tracking-wide">
                <GreetingIcon className="w-3.5 h-3.5 text-amber-200" />
                <span>{greeting.text}, {user?.name || 'Chef'}!</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                What delicious dish are you cooking today?
              </h1>

              <p className="text-xs sm:text-sm text-amber-100 font-normal leading-relaxed">
                Discover curated chef recipes, find dishes based on what is in your pantry, or share your own culinary secrets.
              </p>

              {/* In-hero Search */}
              <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by recipe name, pasta, curry, salmon..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm shadow-md focus:ring-2 focus:ring-amber-300 outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Subtle culinary graphic overlay */}
            <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
              <ChefHat className="w-64 h-64 text-white" />
            </div>
          </section>

          {/* Section 7: Categories Quick Filter Bar */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Explore by Category</span>
              </h2>
              <Link
                to="/recipes"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {standardCategories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => navigate(`/recipes?category=${encodeURIComponent(cat.tag)}`)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer ${cat.bg}`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Popular Recipes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span>Popular Recipes</span>
                </h2>
                <p className="text-xs text-stone-500">Trending dishes loved by our community</p>
              </div>
              <Link
                to="/recipes?sort=popular"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Browse All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : popularRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {popularRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-3">
                <ChefHat className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">No popular recipes found yet.</p>
                <Link
                  to="/create-recipe"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700"
                >
                  Be the first to publish a recipe
                </Link>
              </div>
            )}
          </section>

          {/* Section 4: Recommended Recipes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Recommended for You</span>
                </h2>
                <p className="text-xs text-stone-500">
                  {user?.preferences?.cuisines?.length > 0
                    ? `Tailored to your preferences: ${user.preferences.cuisines.join(', ')}`
                    : 'Handpicked culinary masterpieces for your taste'}
                </p>
              </div>
              <Link
                to="/recipes"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Discover More</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recommendedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommendedRecipes.slice(0, 4).map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">Set your taste preferences for tailored recommendations!</p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100"
                >
                  Configure Profile & Preferences
                </Link>
              </div>
            )}
          </section>

          {/* Section 5: Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <span>Recently Viewed</span>
                  </h2>
                  <p className="text-xs text-stone-500">Pick up right where you left off</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recentlyViewed.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 6: Favorite Recipes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span>Favorite Recipes</span>
                </h2>
                <p className="text-xs text-stone-500">Your personal saved favorites</p>
              </div>
              <Link
                to="/favorites"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View All ({favoriteRecipes.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {favoriteRecipes.slice(0, 4).map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-8 text-center space-y-3">
                <Heart className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">You haven't added any favorite recipes yet.</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click the heart icon on any recipe to save it to your personal favorites collection!
                </p>
                <Link
                  to="/recipes"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700"
                >
                  Explore Recipes
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
