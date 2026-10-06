import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, switchRole } = useAuth();
  const { showToast } = useToast();
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <ChefHat className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
              Recipe<span className="text-amber-600">Haven</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-600 -mt-1">
              Culinary Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-amber-600 bg-amber-50 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            All Recipes
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            <Heart className="w-4 h-4" />
            Favorites
          </NavLink>
          <NavLink
            to="/shopping-list"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            <ShoppingBag className="w-4 h-4" />
            Shopping List
          </NavLink>

          {/* Admin link in main nav if admin */}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-orange-700 bg-orange-100/70 font-semibold'
                    : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-semibold'
                }`
              }
            >
              <Shield className="w-4 h-4 text-orange-600" />
              Admin Dashboard
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
                  className="flex items-center gap-2 p-1.5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-stone-50 transition-all cursor-pointer"
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
                    <span className="text-xs font-bold text-stone-800 max-w-[110px] truncate leading-tight">
                      {user?.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold leading-none ${
                        isAdmin ? 'text-orange-700' : 'text-amber-700'
                      }`}
                    >
                      {isAdmin ? '🛡️ Admin' : '👤 Home Chef'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-fade-in text-stone-800 text-sm">
                    {/* User header */}
                    <div className="px-4 py-2 border-b border-stone-100">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900 truncate">{user?.name}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            isAdmin
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {user?.role}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{user?.email}</p>
                    </div>

                    {/* Instant 1-Click Role Switcher */}
                    <div className="p-2 border-b border-stone-100 bg-stone-50/70">
                      <button
                        type="button"
                        onClick={handleQuickRoleSwitch}
                        disabled={switching}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border shadow-2xs ${
                          isAdmin
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{isAdmin ? 'Switch to User (Chef Demo)' : 'Switch to Admin Demo'}</span>
                        </span>
                        <span className="text-[10px] bg-white px-1.5 py-0.5 rounded font-mono shadow-2xs">
                          1-Click
                        </span>
                      </button>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors font-medium"
                      >
                        <ChefHat className="w-4 h-4 text-amber-600" />
                        <span>Chef Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>Profile & Preferences</span>
                      </Link>

                      <Link
                        to="/my-recipes"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      >
                        <Utensils className="w-4 h-4 text-stone-400" />
                        <span>My Recipes</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Favorite Recipes</span>
                      </Link>

                      <Link
                        to="/saved-recipes"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span>Saved Bookmarks</span>
                      </Link>

                      <Link
                        to="/shopping-list"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>Shopping List</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-orange-700 font-semibold hover:bg-orange-50 transition-colors border-t border-stone-100 mt-1"
                        >
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-400 text-stone-800 hover:text-amber-700 text-xs sm:text-sm font-semibold transition-all hover:bg-stone-50"
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>User Login</span>
              </Link>

              {/* Admin Login Direct Link */}
              <Link
                to="/login?role=admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-800 text-xs sm:text-sm font-semibold transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-orange-600" />
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-50"
          >
            Explore
          </Link>
          <Link
            to="/recipes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-50"
          >
            All Recipes
          </Link>
          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-50"
          >
            Favorites
          </Link>
          <Link
            to="/shopping-list"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-50"
          >
            Shopping List
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-bold text-amber-800 bg-amber-50"
              >
                Dashboard
              </Link>
              <Link
                to="/create-recipe"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-50"
              >
                Create Recipe
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-50"
              >
                Profile & Cooking Preferences
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-orange-600 hover:bg-orange-50"
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
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2"
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
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login?role=user"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-stone-200 text-stone-800 font-bold text-sm flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>User / Chef Login</span>
              </Link>
              <Link
                to="/login?role=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-orange-600" />
                <span>Administrator Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm"
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
