import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
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
  Camera,
  UploadCloud,
  Upload,
  Trash2,
  Image,
  Phone,
  Globe,
  MapPin,
} from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

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
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
];

export default function Profile() {
  const { user, updateProfile, updatePreferences, changePassword } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // File upload state & ref
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Basic Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || PRESET_AVATARS[0],
    bio: user?.bio || '',
    contactEmail: user?.contactEmail || user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
    instagram: user?.instagram || '',
    website: user?.website || '',
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
        contactEmail: user.contactEmail || user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        instagram: user.instagram || '',
        website: user.website || '',
      });
      setPreferences({
        cuisines: user.preferences?.cuisines || [],
        dietType: user.preferences?.dietType || 'None',
        mealTypes: user.preferences?.mealTypes || [],
      });
    }
  }, [user]);

  // Handle direct file upload for profile image
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadingImage(false);
      if (res.success && res.url) {
        setProfileForm((prev) => ({ ...prev, avatar: res.url }));
        // Automatically persist into user profile
        await updateProfile({ ...profileForm, avatar: res.url });
        showToast('Profile photo updated successfully!', 'success');
      } else {
        showToast(res.message || 'Image upload failed', 'error');
      }
    } catch (err) {
      setUploadingImage(false);
      showToast(err.message || 'Failed to upload image. Please try again.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

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
    <div className="flex-1 bg-stone-50/70 dark:bg-stone-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top User Hero Card */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/50 dark:from-amber-600/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          {/* Avatar Preview & Direct Upload Button */}
          <div className="relative group shrink-0">
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-amber-100 dark:border-amber-900/40 shadow-md cursor-pointer group/avatar"
              title="Click to change profile picture"
            >
              <img
                src={profileForm.avatar || PRESET_AVATARS[0]}
                alt={user?.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                onError={(e) => {
                  e.target.src = PRESET_AVATARS[0];
                }}
              />

              {/* Hover overlay with Camera */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Change</span>
              </div>

              {/* Uploading loading spinner overlay */}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-7 h-7 animate-spin text-amber-400 mb-1" />
                  <span className="text-[10px] font-semibold">Uploading...</span>
                </div>
              )}
            </div>

            {/* Quick action camera button badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              title="Upload new profile picture"
              className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white rounded-xl shadow-md border-2 border-white dark:border-stone-900 transition-all transform hover:scale-110 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {user?.role === 'admin' && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white p-1 rounded-lg shadow-md border-2 border-white dark:border-stone-900" title="Administrator">
                <Shield className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Info & Stats */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                {user?.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold self-center sm:self-auto uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Home Chef'}
              </span>
            </div>

            <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span>{user?.email}</span>
            </p>

            {user?.bio ? (
              <p className="text-sm text-stone-700 dark:text-stone-300 italic max-w-xl pt-1">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-xs text-stone-400 dark:text-stone-500 italic pt-1">
                No bio added yet. Click edit below to share your culinary story and cooking philosophy.
              </p>
            )}

            {/* Quick Stats Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{user?.favorites?.length || 0} Favorites</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 text-xs font-semibold text-orange-900 dark:text-orange-300">
                <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                <span>{user?.bookmarks?.length || 0} Saved</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
                <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'profile'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Details
            </span>
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'preferences'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Cooking Preferences
            </span>
            {activeTab === 'preferences' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'security'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Account Security
            </span>
            {activeTab === 'security' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: Profile Details Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Personal Information</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Update your public profile display name, avatar, and chef bio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-750 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 text-sm outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Profile Picture Management */}
            <div className="bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Profile Photo & Avatar
                  </label>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Upload a custom photo from your device or select a chef avatar below.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors border border-amber-200/60 dark:border-amber-800/40 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-400" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>Upload from Device</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-2">
                  Chef Avatars
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {PRESET_AVATARS.map((url, i) => {
                    const isSelected = profileForm.avatar === url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setProfileForm((prev) => ({ ...prev, avatar: url }))}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-amber-600 ring-2 ring-amber-500/30 scale-105 shadow-sm'
                            : 'border-transparent hover:border-amber-300 opacity-75 hover:opacity-100'
                        }`}
                        title={`Select Avatar ${i + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Avatar option ${i + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <span className="absolute inset-0 bg-amber-600/20 flex items-center justify-center">
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Image URL */}
              <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800">
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  Or Paste an Image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 text-xs outline-hidden transition-all"
                    />
                    <Image className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {profileForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, avatar: PRESET_AVATARS[0] })}
                      className="px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors border border-stone-200/80 dark:border-stone-700"
                      title="Reset to default avatar"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Chef Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Chef Bio / Cooking Philosophy
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Share a short culinary background or what dishes you love crafting..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-750 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 text-sm outline-hidden transition-all"
              />
            </div>

            {/* Public Chef Contact Details */}
            <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Chef Contact Information
                  </h4>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  These details appear under your published recipes so foodies, collaborators, and clients can reach you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Contact / Inquiries Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileForm.contactEmail}
                      onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                      placeholder={user?.email || 'chef@recipehaven.com'}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 outline-hidden transition-all"
                    />
                    <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 outline-hidden transition-all"
                    />
                    <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kitchen / Studio Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA or Rome, Italy"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 outline-hidden transition-all"
                    />
                    <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.instagram}
                      onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                      placeholder="@culinary_chef"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 outline-hidden transition-all"
                    />
                    <InstagramIcon className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Website or Culinary Portfolio
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      placeholder="https://chefkitchen.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 outline-hidden transition-all"
                    />
                    <Globe className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
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
          <form onSubmit={handleSavePreferences} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Personalize Your Cooking Experience</h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                We use these preferences to tailor the "Recommended for You" feed on your home page.
              </p>
            </div>

            {/* Cuisines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Favorite Cuisines (Select all you enjoy)
                </label>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {preferences.cuisines.length} selected
                </span>
              </div>

              {preferences.cuisines.length === 0 && (
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
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
                          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
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
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2.5">
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
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-600 dark:border-amber-500 text-amber-900 dark:text-amber-300 shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300'
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
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Preferred Meal Types
                </label>
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
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
                          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
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
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Change Password</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Ensure your account is using a long, secure password.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-750 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 text-sm outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-750 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 text-sm outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-750 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 text-sm outline-hidden transition-all"
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
