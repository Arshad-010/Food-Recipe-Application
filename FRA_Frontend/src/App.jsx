import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import CreateEditRecipe from './pages/CreateEditRecipe';
import Favorites from './pages/Favorites';
import ShoppingList from './pages/ShoppingList';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'].some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/20 dark:bg-stone-950 text-stone-800 dark:text-stone-100 font-sans selection:bg-amber-200 dark:selection:bg-amber-900/50 selection:text-amber-900 dark:selection:text-amber-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex flex-col">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-recipe"
                  element={
                    <ProtectedRoute>
                      <CreateEditRecipe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-recipe/:id"
                  element={
                    <ProtectedRoute>
                      <CreateEditRecipe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved-recipes"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-recipes"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shopping-list"
                  element={
                    <ProtectedRoute>
                      <ShoppingList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Routes */}
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            {!isAuthPage && <Footer />}
          </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
