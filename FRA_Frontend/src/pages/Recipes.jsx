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
} from 'lucide-react';
import api from '../api/axios';
import RecipeCard from '../components/RecipeCard';

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [selectedMealType, setSelectedMealType] = useState(searchParams.get('mealType') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [selectedMaxTime, setSelectedMaxTime] = useState(searchParams.get('maxTime') || '');
  const [selectedDietaryTag, setSelectedDietaryTag] = useState(searchParams.get('dietaryTag') || 'All');
  const [selectedFoodType, setSelectedFoodType] = useState(searchParams.get('foodType') || 'All');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'popular');
  const [currentPage, setCurrentPage] = useState(1);

  const [recipes, setRecipes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedCuisine(searchParams.get('cuisine') || 'All');
    setSelectedMealType(searchParams.get('mealType') || 'All');
    setSelectedDifficulty(searchParams.get('difficulty') || 'All');
    setSelectedMaxTime(searchParams.get('maxTime') || '');
    setSelectedDietaryTag(searchParams.get('dietaryTag') || 'All');
    setSelectedFoodType(searchParams.get('foodType') || 'All');
    setSelectedSort(searchParams.get('sort') || 'popular');
  }, [searchParams]);

  // Fetch recipes with active filters
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (searchTerm) params.append('q', searchTerm);
        if (selectedCuisine && selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);
        if (selectedMealType && selectedMealType !== 'All') params.append('mealType', selectedMealType);
        if (selectedDifficulty && selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
        if (selectedMaxTime) params.append('maxTime', selectedMaxTime);
        if (selectedDietaryTag && selectedDietaryTag !== 'All') params.append('dietaryTag', selectedDietaryTag);
        if (selectedFoodType && selectedFoodType !== 'All') params.append('foodType', selectedFoodType);
        if (selectedSort) params.append('sort', selectedSort);
        params.append('page', currentPage);
        params.append('limit', 12);

        const res = await api.get(`/recipes?${params.toString()}`);
        if (res.success) {
          setRecipes(res.recipes || []);
          setTotalCount(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [
    searchTerm,
    selectedCuisine,
    selectedMealType,
    selectedDifficulty,
    selectedMaxTime,
    selectedDietaryTag,
    selectedFoodType,
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
    e.preventDefault();
    updateFilterParam('q', searchTerm.trim());
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('All');
    setSelectedMealType('All');
    setSelectedDifficulty('All');
    setSelectedMaxTime('');
    setSelectedDietaryTag('All');
    setSelectedFoodType('All');
    setSelectedSort('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  const cuisinesList = [
    'All',
    'Italian',
    'Indian',
    'Mexican',
    'Japanese',
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
    Boolean(searchTerm),
  ].filter(Boolean).length;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Explore All Recipes
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Search dishes by name or ingredients, refine by cooking time, cuisine, and dietary preferences.
        </p>
      </div>

      {/* Search and Top Controls */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes by name or ingredients (e.g., chicken, garlic, tomatoes)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  updateFilterParam('q', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Cuisine Select */}
            <select
              value={selectedCuisine}
              onChange={(e) => updateFilterParam('cuisine', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
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
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
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
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
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
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
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
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              {dietaryTagsList.map((tag) => (
                <option key={tag} value={tag}>
                  {tag === 'All' ? 'All Diets' : tag}
                </option>
              ))}
            </select>

            {/* Veg / Non-Veg Filter */}
            <div className="flex items-center rounded-xl border border-stone-200 overflow-hidden text-xs font-semibold">
              {[{ label: 'All Food', value: 'All' }, { label: '🥦 Veg', value: 'Veg' }, { label: '🍗 Non-Veg', value: 'Non-Veg' }].map((opt) => (
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
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => updateFilterParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
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
        <p className="text-sm font-semibold text-stone-600">
          Showing <span className="text-stone-900 font-bold">{recipes.length}</span> of{' '}
          <span className="text-stone-900 font-bold">{totalCount}</span> recipes
        </p>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-88 rounded-3xl bg-stone-200/70 animate-pulse" />
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
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-stone-600 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
          <UtensilsCrossed className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-800">No matching recipes found</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
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
