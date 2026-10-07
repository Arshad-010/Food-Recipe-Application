import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Heart, Bookmark, Utensils, Plus, ChefHat, Trash2, Edit } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import RecipeCard from '../components/RecipeCard';

export default function Favorites() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getTabFromPath = () => {
    if (location.pathname.includes('my-recipes')) return 'myRecipes';
    if (location.pathname.includes('saved-recipes')) return 'bookmarks';
    return searchParams.get('tab') || 'favorites';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, searchParams]);

  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const res = await api.get('/recipes/my/collections');
        if (res.success) {
          setFavorites(res.favorites || []);
          setBookmarks(res.bookmarks || []);
          setMyRecipes(res.myRecipes || []);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleFavoriteToggle = (recipeId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((r) => r._id !== recipeId));
    }
  };

  const handleBookmarkToggle = (recipeId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks((prev) => prev.filter((r) => r._id !== recipeId));
    }
  };

  const handleDeleteMyRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const res = await api.delete(`/recipes/${recipeId}`);
      if (res.success) {
        showToast('Recipe deleted', 'success');
        setMyRecipes((prev) => prev.filter((r) => r._id !== recipeId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            My Culinary Collections
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Access your liked recipes, saved bookmarks, and custom creations in one place.
          </p>
        </div>

        <Link
          to="/create-recipe"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipe</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 mb-8 space-x-2 sm:space-x-4">
        <button
          type="button"
          onClick={() => handleTabChange('favorites')}
          className={`pb-3.5 px-3 sm:px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'favorites'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Favorites ({favorites.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('bookmarks')}
          className={`pb-3.5 px-3 sm:px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Bookmark className="w-4 h-4 fill-current" />
          <span>Saved Bookmarks ({bookmarks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('my-recipes')}
          className={`pb-3.5 px-3 sm:px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'my-recipes'
              ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>My Created Recipes ({myRecipes.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-stone-200/70 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'favorites' ? (
        favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 shadow-xs">
            <Heart className="w-16 h-16 text-rose-200 dark:text-rose-900/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">No favorite recipes yet</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Click the heart icon on any recipe card to save it here for quick access.
            </p>
            <Link
              to="/recipes"
              className="mt-5 inline-block px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
            >
              Explore Recipes
            </Link>
          </div>
        )
      ) : activeTab === 'bookmarks' ? (
        bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookmarks.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 shadow-xs">
            <Bookmark className="w-16 h-16 text-amber-200 dark:text-amber-900/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">No saved bookmarks yet</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Save recipes to your bookmarks to plan your upcoming meals and dinner parties.
            </p>
            <Link
              to="/recipes"
              className="mt-5 inline-block px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
            >
              Discover Recipes
            </Link>
          </div>
        )
      ) : (
        /* My Recipes Tab */
        myRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-stone-100 dark:bg-stone-950">
                    <img
                      src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-[11px] font-bold text-stone-900 dark:text-stone-100 shadow-xs">
                      {recipe.cuisine}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 line-clamp-1">{recipe.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">{recipe.description}</p>
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-3">
                      <span>{recipe.prepTime + recipe.cookTime} mins</span>
                      <span>•</span>
                      <span>{recipe.ingredients?.length || 0} ingredients</span>
                      <span>•</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">★ {recipe.averageRating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <Link
                    to={`/recipes/${recipe._id}`}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                  >
                    View Dish &rarr;
                  </Link>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/edit-recipe/${recipe._id}`}
                      className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-stone-750 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteMyRecipe(recipe._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 shadow-xs">
            <ChefHat className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">You haven't authored any recipes yet</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Share your own signature cooking recipes and food photos with the community.
            </p>
            <Link
              to="/create-recipe"
              className="mt-5 inline-block px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
            >
              Create Your First Recipe
            </Link>
          </div>
        )
      )}
    </div>
  );
}
