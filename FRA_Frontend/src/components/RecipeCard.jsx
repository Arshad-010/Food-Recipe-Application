import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Star, Heart, Bookmark, ChefHat, Flame, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function RecipeCard({ recipe, onFavoriteToggle, onBookmarkToggle }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isFavorited, setIsFavorited] = useState(() => {
    if (!user || !user.favorites) return false;
    return user.favorites.some((fav) => (typeof fav === 'string' ? fav === recipe._id : fav._id === recipe._id));
  });

  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (!user || !user.bookmarks) return false;
    return user.bookmarks.some((b) => (typeof b === 'string' ? b === recipe._id : b._id === recipe._id));
  });

  const [favCount, setFavCount] = useState(recipe.favoritesCount || 0);
  const [imgError, setImgError] = useState(false);

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const difficultyColors = {
    Easy: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Hard: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to favorite recipes', 'info');
      navigate('/login');
      return;
    }

    try {
      const nextState = !isFavorited;
      setIsFavorited(nextState);
      setFavCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      if (res.success) {
        showToast(res.message, 'success');
        if (onFavoriteToggle) onFavoriteToggle(recipe._id, res.isFavorited);
      }
    } catch (err) {
      // Revert on error
      setIsFavorited(!isFavorited);
      setFavCount((prev) => (isFavorited ? prev + 1 : Math.max(0, prev - 1)));
      showToast(err.message, 'error');
    }
  };

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to save bookmarks', 'info');
      navigate('/login');
      return;
    }

    try {
      const nextState = !isBookmarked;
      setIsBookmarked(nextState);

      const res = await api.post(`/recipes/${recipe._id}/bookmark`);
      if (res.success) {
        showToast(res.message, 'success');
        if (onBookmarkToggle) onBookmarkToggle(recipe._id, res.isBookmarked);
      }
    } catch (err) {
      setIsBookmarked(!isBookmarked);
      showToast(err.message, 'error');
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Recipe Image & Top Overlays */}
      <Link to={`/recipes/${recipe._id}`} className="relative block aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={imgError ? fallbackImage : recipe.image || fallbackImage}
          alt={recipe.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient dark overlay for badge contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-stone-950/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-[11px] font-bold text-stone-900 dark:text-stone-100 shadow-xs">
            {recipe.cuisine}
          </span>
          <span
            className={`px-2 py-0.5 rounded-xl text-[10px] font-bold border backdrop-blur-md shadow-xs ${
              difficultyColors[recipe.difficulty] || difficultyColors.Medium
            }`}
          >
            {recipe.difficulty}
          </span>
          {recipe.videoUrl && (
            <span className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-red-600/90 text-white flex items-center gap-1 shadow-xs backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ▶ Video Tutorial
            </span>
          )}
          {recipe.isFeatured && (
            <span className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          {recipe.matchCount !== undefined && (
            <span className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              {recipe.matchCount} Match ({recipe.matchPercentage}%)
            </span>
          )}
        </div>

        {/* Action Buttons (Heart + Bookmark) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
            className={`p-2 rounded-2xl backdrop-blur-md transition-all duration-200 shadow-sm ${
              isFavorited
                ? 'bg-rose-500 text-white scale-105'
                : 'bg-white/85 dark:bg-stone-900/85 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label="Save bookmark"
            className={`p-2 rounded-2xl backdrop-blur-md transition-all duration-200 shadow-sm ${
              isBookmarked
                ? 'bg-amber-500 text-white scale-105'
                : 'bg-white/85 dark:bg-stone-900/85 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800 hover:text-amber-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Time & Servings in Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold drop-shadow-sm">
          <span className="flex items-center gap-1 bg-stone-900/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {totalTime} mins
          </span>
          <div className="flex items-center gap-1.5">
            {recipe.videoUrl && (
              <span className="flex items-center gap-1 bg-red-600/90 text-white backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-xs">
                ▶ Video
              </span>
            )}
            <span className="flex items-center gap-1 bg-stone-900/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {recipe.caloriesPerServing ? `${recipe.caloriesPerServing} kcal` : `${recipe.servings || 4} servings`}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Meal Type */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
              {recipe.mealType || 'Dinner'}
            </span>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{recipe.averageRating ? recipe.averageRating.toFixed(1) : '5.0'}</span>
              <span className="text-stone-400 dark:text-stone-500 text-[11px] font-normal">
                ({recipe.ratingsCount || recipe.reviews?.length || 1})
              </span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/recipes/${recipe._id}`} className="block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug">
              {recipe.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {recipe.description}
          </p>

          {/* Dietary Tags */}
          {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.dietaryTags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
              {recipe.dietaryTags.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px]">
                  +{recipe.dietaryTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Author & View Recipe button */}
        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={recipe.author?.avatar || recipe.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={recipe.author?.name || recipe.authorName || 'Chef'}
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400 truncate">
              {recipe.author?.name || recipe.authorName || 'Chef'}
            </span>
          </div>

          <Link
            to={`/recipes/${recipe._id}`}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            Cook Now &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
