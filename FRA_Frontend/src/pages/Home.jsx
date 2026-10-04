import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Heart,
  ShoppingBag,
  Star,
  Flame,
  UtensilsCrossed,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import api from '../api/axios';
import RecipeCard from '../components/RecipeCard';
import SearchAutocomplete from '../components/SearchAutocomplete';


export default function Home() {
  const navigate = useNavigate();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch featured & regular recipes
        const [recipesRes, recsRes] = await Promise.all([
          api.get('/recipes?limit=8&sort=popular'),
          api.get('/recipes/recommendations'),
        ]);

        if (recipesRes.success) {
          setFeaturedRecipes(recipesRes.recipes || []);
        }
        if (recsRes.success) {
          setRecommendedRecipes(recsRes.recommendations || []);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/recipes');
    }
  };

  const cuisines = [
    { name: 'Italian', icon: '🍕', bg: 'from-amber-500/10 to-orange-500/10' },
    { name: 'Indian', icon: '🍛', bg: 'from-orange-500/10 to-red-500/10' },
    { name: 'Mexican', icon: '🌮', bg: 'from-emerald-500/10 to-teal-500/10' },
    { name: 'Japanese', icon: '🍜', bg: 'from-rose-500/10 to-pink-500/10' },
    { name: 'Mediterranean', icon: '🥗', bg: 'from-blue-500/10 to-cyan-500/10' },
    { name: 'American', icon: '🍔', bg: 'from-amber-500/10 to-yellow-500/10' },
    { name: 'French', icon: '🥐', bg: 'from-purple-500/10 to-indigo-500/10' },
    { name: 'Thai', icon: '🍲', bg: 'from-lime-500/10 to-emerald-500/10' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/70 via-amber-50/30 to-stone-50/50 pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-200/50">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-amber-300/80 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            Explore 1,000+ Curated Chef Recipes
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
            Cook with Passion. <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
              Eat with Delight.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover mouthwatering dishes, search recipes by available ingredients, adjust servings dynamically, and follow interactive step-by-step cooking timers.
          </p>

          {/* Interactive Search Bar in Hero with Live Autocomplete Suggestions */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex items-center gap-2 p-1.5 sm:p-2 bg-white rounded-3xl shadow-xl border border-stone-200/90"
          >
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearchSubmit}
              placeholder="Search recipes, dishes, or ingredients (e.g. butter chicken, pasta, garlic)..."
              className="flex-1"
              inputClassName="border-0 bg-transparent py-3 sm:py-3.5 focus:ring-0 text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all hover:shadow-lg cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4 hidden sm:block" />
            </button>
          </form>

          {/* Quick Filter Pill Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-semibold text-stone-500">Popular:</span>
            {['Quick < 30min', 'Vegetarian', 'Italian', 'Mexican', 'Dinner Ideas', 'Gluten-Free'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (tag === 'Quick < 30min') navigate('/recipes?maxTime=30');
                  else if (tag === 'Vegetarian' || tag === 'Gluten-Free') navigate(`/recipes?dietaryTag=${tag}`);
                  else if (tag === 'Italian' || tag === 'Mexican') navigate(`/recipes?cuisine=${tag}`);
                  else navigate(`/recipes?q=${encodeURIComponent(tag)}`);
                }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisines Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Explore by Cuisine</h2>
            <p className="text-sm text-stone-500 mt-1">Taste authentic culinary traditions from around the globe</p>
          </div>
          <Link
            to="/recipes"
            className="text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            All Cuisines &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {cuisines.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => navigate(`/recipes?cuisine=${encodeURIComponent(c.name)}`)}
              className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-400 hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <span className="text-xs font-bold text-stone-800 group-hover:text-amber-700">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Community Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Trending & Featured Recipes</h2>
            <p className="text-sm text-stone-500 mt-1">The most loved, highly-rated dishes by home chefs this week</p>
          </div>
          <Link
            to="/recipes?sort=rating"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm transition-colors self-start sm:self-auto"
          >
            <span>View All Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-stone-200/70 animate-pulse" />
            ))}
          </div>
        ) : featuredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8">
            <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">No recipes loaded yet.</p>
          </div>
        )}
      </section>

      {/* Recommended For You Section */}
      {recommendedRecipes.length > 0 && (
        <section className="py-12 bg-amber-50/50 border-y border-amber-200/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  Tailored Picks
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Recommended For You</h2>
                <p className="text-sm text-stone-500 mt-1">Dishes tailored to your favorite cuisines and cooking tastes</p>
              </div>
              <Link
                to="/recipes"
                className="text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                Explore More &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedRecipes.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900">
            Everything You Need to Master Any Recipe
          </h2>
          <p className="text-sm sm:text-base text-stone-500 mt-2">
            Engineered from the ground up for seamless, delightful home cooking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Smart Serving Adjuster</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Cooking for 2 or hosting 8? Adjust servings with one click and ingredient quantities dynamically recalculate in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">1-Click Shopping List</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Never forget an ingredient at the grocery store. Add recipe ingredients directly to your interactive checklist with ease.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Interactive Cooking Timers</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Follow step-by-step instructions with integrated kitchen countdown timers so your pasta is always al dente and sauce never burns.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              Share Your Culinary Secret
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Have a special family recipe?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Join RecipeHaven today. Publish your culinary creations with food photos, videos, and step-by-step instructions for foodies worldwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/create-recipe"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 text-center transition-all hover:scale-105"
            >
              Create a Recipe
            </Link>
            <Link
              to="/recipes"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm text-center transition-colors"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
