import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  ChefHat,
  Search,
  Bookmark,
  Heart,
  ShoppingBag,
  PlusCircle,
  User,
  LogIn,
  LogOut,
  Shield,
  Utensils,
  Menu,
  X,
  ChevronDown,
  Repeat,
  Sparkles,
  Sun,
  Moon,
  Home,
  Compass,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, switchRole } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    showToast('You have been signed out successfully.', 'info');
    navigate('/');
  };

  const handleQuickRoleSwitch = async () => {
    try {
      setSwitching(true);
      const res = await switchRole();
      setSwitching(false);
      if (res.success) {
        setDropdownOpen(false);
        const newRole = res.user.role === 'admin' ? 'Administrator' : 'Home Chef';
        showToast(`Switched account to ${newRole} (${res.user.name})!`, 'success');
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setSwitching(false);
      showToast(err.message || 'Failed to switch role', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Interactive Hover Slide-Reveal */}
        <Link
          to="/"
          className="flex items-center group py-1 px-1.5 -ml-1 rounded-2xl hover:bg-amber-50/60 dark:hover:bg-stone-800/50 transition-all duration-300 select-none cursor-pointer"
          title="RecipeHaven Home"
          aria-label="RecipeHaven Culinary Studio"
        >
          {/* Compact Icon Badge: Only this is visible by default */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/35 group-hover:scale-105 transition-all duration-300 shrink-0">
            <ChefHat className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
          </div>

          {/* Sliding Brand Title: Folds neatly by default, slides out smoothly when approached/hovered */}
          <div className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[210px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-350 ease-out flex flex-col justify-center pointer-events-none group-hover:pointer-events-auto">
            <span className="font-extrabold text-lg tracking-tight text-stone-900 dark:text-white leading-tight transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300 ease-out">
              Recipe<span className="text-amber-600 dark:text-amber-500">Haven</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700/80 dark:text-amber-400/80 leading-none transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-350 ease-out">
              Culinary Studio
            </span>
          </div>
        </Link>

        {/* Desktop Segmented Floating Island Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-stone-100/70 dark:bg-stone-850/70 border border-stone-200/70 dark:border-stone-800/80 backdrop-blur-xs shadow-2xs">
          {/* Home Button linking to Landing Page */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'text-amber-700 dark:text-amber-300 bg-white dark:bg-stone-900 font-bold shadow-xs border border-amber-200/80 dark:border-amber-500/30'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-800/70'
              }`
            }
          >
            <Home className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Home</span>
          </NavLink>

          {/* All Recipes */}
          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'text-amber-700 dark:text-amber-300 bg-white dark:bg-stone-900 font-bold shadow-xs border border-amber-200/80 dark:border-amber-500/30'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-800/70'
              }`
            }
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>All Recipes</span>
          </NavLink>

          {/* Favorites */}
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'text-amber-700 dark:text-amber-300 bg-white dark:bg-stone-900 font-bold shadow-xs border border-amber-200/80 dark:border-amber-500/30'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-800/70'
              }`
            }
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Favorites</span>
          </NavLink>

          {/* Shopping List */}
          <NavLink
            to="/shopping-list"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'text-amber-700 dark:text-amber-300 bg-white dark:bg-stone-900 font-bold shadow-xs border border-amber-200/80 dark:border-amber-500/30'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-800/70'
              }`
            }
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shopping List</span>
          </NavLink>

          {/* Dashboard link if authenticated */}
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-amber-700 dark:text-amber-300 bg-white dark:bg-stone-900 font-bold shadow-xs border border-amber-200/80 dark:border-amber-500/30'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-800/70'
                }`
              }
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Dashboard</span>
            </NavLink>
          )}

          {/* Admin link in main nav if admin */}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-orange-700 dark:text-orange-400 bg-white dark:bg-stone-900 font-bold shadow-xs border border-orange-300 dark:border-orange-700/60'
                    : 'text-orange-600 dark:text-orange-400 hover:text-orange-700 hover:bg-white/70 dark:hover:bg-stone-800/70'
                }`
              }
            >
              <Shield className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Create Recipe Button */}
              <Link
                to="/create-recipe"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Recipe</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    }}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-100 max-w-[110px] truncate leading-tight">
                      {user?.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold leading-none ${
                        isAdmin ? 'text-orange-700 dark:text-orange-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {isAdmin ? '🛡️ Admin' : '👤 Home Chef'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200/90 dark:border-stone-800 py-2 z-50 animate-fade-in text-stone-800 dark:text-stone-200 text-sm">
                    {/* User header */}
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900 dark:text-white truncate">{user?.name}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            isAdmin
                              ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {user?.role}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">{user?.email}</p>
                    </div>

                    {/* Instant 1-Click Role Switcher */}
                    <div className="p-2 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
                      <button
                        type="button"
                        onClick={handleQuickRoleSwitch}
                        disabled={switching}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border shadow-2xs ${
                          isAdmin
                            ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{isAdmin ? 'Switch to User (Chef Demo)' : 'Switch to Admin Demo'}</span>
                        </span>
                        <span className="text-[10px] bg-white dark:bg-stone-900 px-1.5 py-0.5 rounded font-mono shadow-2xs">
                          1-Click
                        </span>
                      </button>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-400 transition-colors font-medium"
                      >
                        <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        <span>Chef Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <span>Profile & Preferences</span>
                      </Link>

                      <Link
                        to="/my-recipes"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                      >
                        <Utensils className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <span>My Recipes</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Favorite Recipes</span>
                      </Link>

                      <Link
                        to="/saved-recipes"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span>Saved Bookmarks</span>
                      </Link>

                      <Link
                        to="/shopping-list"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Shopping List</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-orange-700 dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors border-t border-stone-100 dark:border-stone-800 mt-1"
                        >
                          <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* User Login Direct Link */}
              <Link
                to="/login?role=user"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 text-xs sm:text-sm font-semibold transition-all hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span>User Login</span>
              </Link>

              {/* Admin Login Direct Link */}
              <Link
                to="/login?role=admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50/70 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-800 dark:text-orange-300 text-xs sm:text-sm font-semibold transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden">Admin</span>
              </Link>

              {/* Sign Up */}
              <Link
                to="/register"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all hover:shadow"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Subtle Vertical Divider */}
          <div className="hidden sm:block h-6 w-px bg-stone-200 dark:bg-stone-800 mx-0.5" />

          {/* Premium Light/Dark Mode Dual Segment Pill Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center p-1 rounded-full bg-stone-100/90 dark:bg-stone-850 border border-stone-200 dark:border-stone-700/80 hover:border-amber-400/80 dark:hover:border-amber-500/70 shadow-2xs transition-all cursor-pointer group select-none shrink-0"
          >
            {/* Light Mode Segment */}
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                !isDark
                  ? 'bg-white text-amber-700 font-bold shadow-xs border border-amber-200/80 scale-[1.02]'
                  : 'text-stone-400 hover:text-stone-700 font-medium'
              }`}
            >
              <Sun
                className={`w-3.5 h-3.5 transition-transform ${
                  !isDark ? 'text-amber-500 fill-amber-400 rotate-0' : 'text-stone-400 -rotate-45'
                }`}
              />
              <span className="text-[11px] tracking-wide hidden sm:inline">Light</span>
            </span>

            {/* Dark Mode Segment */}
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                isDark
                  ? 'bg-stone-900 text-amber-300 font-bold shadow-xs border border-amber-500/40 scale-[1.02]'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              <Moon
                className={`w-3.5 h-3.5 transition-transform ${
                  isDark ? 'text-amber-400 fill-amber-400/40 rotate-0' : 'text-stone-400 rotate-12'
                }`}
              />
              <span className="text-[11px] tracking-wide hidden sm:inline">Dark</span>
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 pt-2 pb-6 space-y-2 transition-colors">
          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium text-sm mb-2"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
              <span>{isDark ? 'Dark Mode (Active)' : 'Light Mode (Active)'}</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-stone-700 shadow-2xs">
              Switch to {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Home</span>
          </Link>
          <Link
            to="/recipes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>All Recipes</span>
          </Link>
          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Heart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Favorites</span>
          </Link>
          <Link
            to="/shopping-list"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Shopping List</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50"
              >
                Dashboard
              </Link>
              <Link
                to="/create-recipe"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Create Recipe
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Profile & Cooking Preferences
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickRoleSwitch();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <Repeat className="w-4 h-4" />
                <span>{isAdmin ? 'Switch to User (Chef Demo)' : 'Switch to Admin Demo'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login?role=user"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>User / Chef Login</span>
              </Link>
              <Link
                to="/login?role=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-100 dark:hover:bg-orange-900/60"
              >
                <Shield className="w-4 h-4 text-orange-600" />
                <span>Administrator Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
