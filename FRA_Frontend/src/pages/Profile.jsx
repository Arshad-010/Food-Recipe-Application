import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Shield,
  UtensilsCrossed,
  Sparkles,
  Heart,
  Bookmark,
  Check,
  Save,
  Lock,
  Loader2,
  Calendar,
  ChefHat,
} from 'lucide-react';

const AVAILABLE_CUISINES = [
  'Indian',
  'Italian',
  'Chinese',
  'Mexican',
  'Japanese',
  'Thai',
  'American',
  'Mediterranean',
  'French',
  'Spanish',
  'Middle Eastern',
  'Korean',
];

const DIET_TYPES = [
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Gluten-Free',
  'Halal',
  'Kosher',
];

const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Beverage',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

export default function Profile() {
  const { user, updateProfile, updatePreferences, changePassword } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Basic Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || PRESET_AVATARS[0],
    bio: user?.bio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Cooking Preferences state
  const [preferences, setPreferences] = useState({
    cuisines: user?.preferences?.cuisines || [],
    dietType: user?.preferences?.dietType || 'None',
    mealTypes: user?.preferences?.mealTypes || [],
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        avatar: user.avatar || PRESET_AVATARS[0],
        bio: user.bio || '',
      });
      setPreferences({
        cuisines: user.preferences?.cuisines || [],
        dietType: user.preferences?.dietType || 'None',
        mealTypes: user.preferences?.mealTypes || [],
      });
    }
  }, [user]);

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setSavingProfile(true);
    const result = await updateProfile(profileForm);
    setSavingProfile(false);
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  };

  // Toggle Cuisine Tag
  const toggleCuisine = (cuisine) => {
    setPreferences((prev) => {
      const exists = prev.cuisines.includes(cuisine);
      return {
        ...prev,
        cuisines: exists
          ? prev.cuisines.filter((c) => c !== cuisine)
          : [...prev.cuisines, cuisine],
      };
    });
  };

  // Toggle Meal Type Tag
  const toggleMealType = (mealType) => {
    setPreferences((prev) => {
      const exists = prev.mealTypes.includes(mealType);
      return {
        ...prev,
        mealTypes: exists
          ? prev.mealTypes.filter((m) => m !== mealType)
          : [...prev.mealTypes, mealType],
      };
    });
  };

  // Handle Preferences Save
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPreferences(true);
    const result = await updatePreferences(preferences);
    setSavingPreferences(false);
    if (result.success) {
      showToast('Cooking preferences updated! We will personalize recommendations for you.', 'success');
    } else {
      showToast(result.error || 'Failed to update preferences', 'error');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Please fill out all password fields', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setSavingPassword(false);

    if (result.success) {
      showToast('Password changed successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } else {
      showToast(result.error || 'Failed to change password', 'error');
    }
  };

  return (
    <div className="flex-1 bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top User Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            <img
              src={profileForm.avatar || PRESET_AVATARS[0]}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-amber-100 shadow-md"
              onError={(e) => {
                e.target.src = PRESET_AVATARS[0];
              }}
            />
            {user?.role === 'admin' && (
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white" title="Administrator">
                <Shield className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Info & Stats */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {user?.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold self-center sm:self-auto uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Home Chef'}
              </span>
            </div>

            <p className="text-sm text-stone-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>{user?.email}</span>
            </p>

            {user?.bio ? (
              <p className="text-sm text-stone-700 italic max-w-xl pt-1">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-xs text-stone-400 italic pt-1">
                No bio added yet. Click edit below to share your culinary story and cooking philosophy.
              </p>
            )}

            {/* Quick Stats Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-900">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{user?.favorites?.length || 0} Favorites</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-900">
                <Bookmark className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>{user?.bookmarks?.length || 0} Saved</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'profile'
                ? 'text-amber-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Details
            </span>
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'preferences'
                ? 'text-amber-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Cooking Preferences
            </span>
            {activeTab === 'preferences' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'security'
                ? 'text-amber-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Account Security
            </span>
            {activeTab === 'security' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: Profile Details Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Personal Information</h3>
              <p className="text-xs text-stone-500">Update your public profile display name, avatar, and chef bio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Custom Avatar URL or Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm outline-hidden transition-all mb-3"
              />

              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500">Or pick an avatar:</span>
                <div className="flex items-center gap-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, avatar: url })}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                        profileForm.avatar === url
                          ? 'border-amber-600 scale-105 shadow-sm'
                          : 'border-transparent hover:border-stone-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chef Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Chef Bio / Cooking Philosophy
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Share a short culinary background or what dishes you love crafting..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm outline-hidden transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-70"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Cooking Preferences Form */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-stone-900">Personalize Your Cooking Experience</h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                We use these preferences to tailor the "Recommended for You" feed on your home page.
              </p>
            </div>

            {/* Cuisines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Favorite Cuisines (Select all you enjoy)
                </label>
                <span className="text-xs font-semibold text-amber-700">
                  {preferences.cuisines.length} selected
                </span>
              </div>

              {preferences.cuisines.length === 0 && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>No favorite cuisines selected yet. Choose any cuisines you enjoy below to receive tailored recipe recommendations.</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_CUISINES.map((cuisine) => {
                  const isSelected = preferences.cuisines.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{cuisine}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                Dietary Preference / Restrictions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DIET_TYPES.map((diet) => {
                  const isSelected = preferences.dietType === diet;
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, dietType: diet })}
                      className={`p-3 rounded-xl text-sm font-medium border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Meal Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Preferred Meal Types
                </label>
                <span className="text-xs font-semibold text-orange-700">
                  {preferences.mealTypes.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {MEAL_TYPES.map((meal) => {
                  const isSelected = preferences.mealTypes.includes(meal);
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => toggleMealType(meal)}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{meal}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPreferences}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-70"
              >
                {savingPreferences ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Change Password</h3>
              <p className="text-xs text-stone-500">Ensure your account is using a long, secure password.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm outline-hidden transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-70"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
