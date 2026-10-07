import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';
import api from '../api/axios';
import RecipeCard from '../components/RecipeCard';
import SearchAutocomplete from '../components/SearchAutocomplete';

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [ingredientSearch, setIngredientSearch] = useState(searchParams.get('ingredients') || '');
  const [showIngredientBox, setShowIngredientBox] = useState(Boolean(searchParams.get('ingredients')));

  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [selectedMealType, setSelectedMealType] = useState(searchParams.get('mealType') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [selectedMaxTime, setSelectedMaxTime] = useState(searchParams.get('maxTime') || '');
  const [selectedDietaryTag, setSelectedDietaryTag] = useState(searchParams.get('dietaryTag') || 'All');
  const [selectedFoodType, setSelectedFoodType] = useState(searchParams.get('foodType') || 'All');
  const [selectedHasVideo, setSelectedHasVideo] = useState(searchParams.get('hasVideo') === 'true');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'popular');
  const [currentPage, setCurrentPage] = useState(1);

  const [recipes, setRecipes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setIngredientSearch(searchParams.get('ingredients') || '');
    if (searchParams.get('ingredients')) setShowIngredientBox(true);
    setSelectedCuisine(searchParams.get('cuisine') || 'All');
    setSelectedMealType(searchParams.get('mealType') || 'All');
    setSelectedDifficulty(searchParams.get('difficulty') || 'All');
    setSelectedMaxTime(searchParams.get('maxTime') || '');
    setSelectedDietaryTag(searchParams.get('dietaryTag') || 'All');
    setSelectedFoodType(searchParams.get('foodType') || 'All');
    setSelectedHasVideo(searchParams.get('hasVideo') === 'true');
    setSelectedSort(searchParams.get('sort') || 'popular');
  }, [searchParams]);

  // Fetch recipes with active filters
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();

        if (ingredientSearch.trim()) {
          // If searching by ingredients, use dedicated search endpoint
          params.append('ingredients', ingredientSearch.trim());
          if (searchTerm) params.append('q', searchTerm.trim());
          if (selectedCuisine && selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);
          if (selectedMealType && selectedMealType !== 'All') params.append('mealType', selectedMealType);
          if (selectedFoodType && selectedFoodType !== 'All') params.append('foodType', selectedFoodType);
          if (selectedHasVideo) params.append('hasVideo', 'true');
          params.append('page', currentPage);
          params.append('limit', 12);

          const res = await api.get(`/recipes/search?${params.toString()}`);
          if (res.success) {
            const list = res.recipes || [];
            // Prioritize recipes with video URLs so they appear above
            list.sort((a, b) => {
              const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
              const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
              if (hasA && !hasB) return -1;
              if (!hasA && hasB) return 1;
              return 0;
            });
            setRecipes(list);
            setTotalCount(res.total || 0);
            setTotalPages(res.totalPages || 1);
          } else {
            setRecipes([]);
            setTotalCount(0);
          }
        } else {
          // Standard filtered list
          if (searchTerm) params.append('q', searchTerm);
          if (selectedCuisine && selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);
          if (selectedMealType && selectedMealType !== 'All') params.append('mealType', selectedMealType);
          if (selectedDifficulty && selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
          if (selectedMaxTime) params.append('maxTime', selectedMaxTime);
          if (selectedDietaryTag && selectedDietaryTag !== 'All') params.append('dietaryTag', selectedDietaryTag);
          if (selectedFoodType && selectedFoodType !== 'All') params.append('foodType', selectedFoodType);
          if (selectedHasVideo) params.append('hasVideo', 'true');
          if (selectedSort) params.append('sort', selectedSort);
          params.append('page', currentPage);
          params.append('limit', 12);

          const res = await api.get(`/recipes?${params.toString()}`);
          if (res.success) {
            const list = res.recipes || [];
            // Prioritize recipes with video URLs so they appear above
            list.sort((a, b) => {
              const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
              const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
              if (hasA && !hasB) return -1;
              if (!hasA && hasB) return 1;
              return 0;
            });
            setRecipes(list);
            setTotalCount(res.total || 0);
            setTotalPages(res.totalPages || 1);
          } else {
            setRecipes([]);
            setTotalCount(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setError(err.message || 'Unable to connect to the server. Please try again.');
        setRecipes([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [
    searchTerm,
    ingredientSearch,
    selectedCuisine,
    selectedMealType,
    selectedDifficulty,
    selectedMaxTime,
    selectedDietaryTag,
    selectedFoodType,
    selectedHasVideo,
    selectedSort,
    currentPage,
  ]);

  // Update URL search parameters
  const updateFilterParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateFilterParam('q', searchTerm.trim());
  };

  const handleIngredientSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateFilterParam('ingredients', ingredientSearch.trim());
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setIngredientSearch('');
    setSelectedCuisine('All');
    setSelectedMealType('All');
    setSelectedDifficulty('All');
    setSelectedMaxTime('');
    setSelectedDietaryTag('All');
    setSelectedFoodType('All');
    setSelectedHasVideo(false);
    setSelectedSort('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  const cuisinesList = [
    'All',
    'Indian',
    'Italian',
    'Mexican',
    'Spanish',
    'Japanese',
    'Chinese',
    'Korean',
    'Mediterranean',
    'American',
    'French',
    'Thai',
  ];

  const mealTypesList = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Beverages',
  ];

  const difficultiesList = ['All', 'Easy', 'Medium', 'Hard'];

  const dietaryTagsList = [
    'All',
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Keto',
    'Pescatarian',
  ];

  const activeFilterCount = [
    selectedCuisine !== 'All',
    selectedMealType !== 'All',
    selectedDifficulty !== 'All',
    Boolean(selectedMaxTime),
    selectedDietaryTag !== 'All',
    selectedFoodType !== 'All',
    selectedHasVideo,
    Boolean(searchTerm),
    Boolean(ingredientSearch),
  ].filter(Boolean).length;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Explore All Recipes
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Search dishes by name or ingredients, refine by cooking time, cuisine, and dietary preferences.
        </p>
      </div>

      {/* Search and Top Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        {/* Keyword Search with Live Autocomplete Suggestions */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <SearchAutocomplete
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearchSubmit}
            placeholder="Search recipes by name (e.g. Butter Chicken, Pasta, Ramen)..."
            className="flex-1"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowIngredientBox(!showIngredientBox)}
            className={`px-4 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border ${
              showIngredientBox
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Search by Ingredients</span>
          </button>
        </form>

        {/* Dedicated "What's in your fridge?" Ingredient Search Box */}
        {showIngredientBox && (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Find Recipes with Your Available Ingredients (Ranked by Match):
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowIngredientBox(false);
                  if (ingredientSearch) {
                    setIngredientSearch('');
                    updateFilterParam('ingredients', '');
                  }
                }}
                className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleIngredientSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                placeholder="Enter ingredients separated by commas (e.g. garlic, tomatoes, chicken, onion)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Match Recipes
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-emerald-800 dark:text-emerald-400 text-[11px]">Quick picks:</span>
              {['garlic, tomato, pasta', 'chicken, ginger, garlic', 'potato, onion, cheese', 'egg, bread, milk'].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    setIngredientSearch(quick);
                    updateFilterParam('ingredients', quick);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-[11px] font-medium transition-colors"
                >
                  +{quick}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Cuisine Select */}
            <select
              value={selectedCuisine}
              onChange={(e) => updateFilterParam('cuisine', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              {cuisinesList.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Cuisines' : c}
                </option>
              ))}
            </select>

            {/* Meal Type Select */}
            <select
              value={selectedMealType}
              onChange={(e) => updateFilterParam('mealType', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              {mealTypesList.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Meal Types' : m}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => updateFilterParam('difficulty', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              {difficultiesList.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>

            {/* Max Cooking Time Select */}
            <select
              value={selectedMaxTime}
              onChange={(e) => updateFilterParam('maxTime', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              <option value="">Any Cook Time</option>
              <option value="15">Under 15 Mins</option>
              <option value="30">Under 30 Mins</option>
              <option value="45">Under 45 Mins</option>
              <option value="60">Under 1 Hour</option>
            </select>

            {/* Dietary Preference */}
            <select
              value={selectedDietaryTag}
              onChange={(e) => updateFilterParam('dietaryTag', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              {dietaryTagsList.map((tag) => (
                <option key={tag} value={tag}>
                  {tag === 'All' ? 'All Diets' : tag}
                </option>
              ))}
            </select>

            {/* Veg / Non-Veg Filter */}
            <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden text-xs font-semibold">
              {[
                { label: 'All Food', value: 'All' },
                { label: '🥦 Veg', value: 'Veg' },
                { label: '🍗 Non-Veg', value: 'Non-Veg' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedFoodType(opt.value);
                    updateFilterParam('foodType', opt.value);
                  }}
                  className={`px-3 py-2 transition-colors cursor-pointer ${
                    selectedFoodType === opt.value
                      ? opt.value === 'Veg'
                        ? 'bg-green-600 text-white'
                        : opt.value === 'Non-Veg'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-600 text-white'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Video Recipes Filter Button */}
            <button
              type="button"
              onClick={() => {
                const next = !selectedHasVideo;
                setSelectedHasVideo(next);
                updateFilterParam('hasVideo', next ? 'true' : '');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedHasVideo
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-red-600 dark:hover:text-red-400'
              }`}
              title="Show recipes with step-by-step video tutorials"
            >
              <span className={`w-2 h-2 rounded-full ${selectedHasVideo ? 'bg-white' : 'bg-red-500 animate-pulse'}`} />
              <span>▶ Video Tutorials</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => updateFilterParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="time">Fastest Cook Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
          Showing <span className="text-stone-900 dark:text-white font-bold">{recipes.length}</span> of{' '}
          <span className="text-stone-900 dark:text-white font-bold">{totalCount}</span> recipes
          {ingredientSearch && (
            <span className="ml-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              Matched by: {ingredientSearch}
            </span>
          )}
        </p>
      </div>

      {/* Recipes Grid */}
      {error ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-red-200/80 dark:border-red-900/60 p-8 shadow-xs">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Connection Error</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              const p = new URLSearchParams(searchParams);
              p.set('t', Date.now().toString());
              setSearchParams(p);
            }}
            className="mt-5 px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-88 rounded-3xl bg-stone-200/70 dark:bg-stone-800/70 animate-pulse" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 shadow-xs">
          <UtensilsCrossed className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">No matching recipes found</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, clearing specific filters, or checking different cuisines.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="mt-5 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
