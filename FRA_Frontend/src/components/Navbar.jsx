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
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
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
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <span className="hidden sm:block text-xs font-semibold text-stone-800 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-fade-in text-stone-800 text-sm">
                    {/* User header */}
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="font-bold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-xs text-stone-600 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
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
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
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
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-stone-700 hover:text-amber-600 text-sm font-medium transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow-xs transition-all hover:shadow"
              >
                <span>Sign Up</span>
              </Link>
            </>
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
                to="/create-recipe"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-600 bg-amber-50"
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
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl border border-stone-300 text-stone-800 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-amber-600 text-white font-medium"
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
