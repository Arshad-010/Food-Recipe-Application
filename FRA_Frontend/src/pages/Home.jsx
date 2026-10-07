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
  Mail,
  FileText,
  ShieldCheck,
  Share2,
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
          const list = recipesRes.recipes || [];
          list.sort((a, b) => {
            const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
            const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
            if (hasA && !hasB) return -1;
            if (!hasA && hasB) return 1;
            return 0;
          });
          setFeaturedRecipes(list);
        }
        if (recsRes.success) {
          const list = recsRes.recommendations || [];
          list.sort((a, b) => {
            const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
            const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
            if (hasA && !hasB) return -1;
            if (!hasA && hasB) return 1;
            return 0;
          });
          setRecommendedRecipes(list);
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
    { name: 'Indian', icon: '🍛', bg: 'from-orange-500/10 to-red-500/10' },
    { name: 'Italian', icon: '🍕', bg: 'from-amber-500/10 to-orange-500/10' },
    { name: 'Mexican', icon: '🌮', bg: 'from-emerald-500/10 to-teal-500/10' },
    { name: 'Spanish', icon: '🥘', bg: 'from-yellow-500/10 to-orange-500/10' },
    { name: 'Japanese', icon: '🍜', bg: 'from-rose-500/10 to-pink-500/10' },
    { name: 'Chinese', icon: '🥟', bg: 'from-red-500/10 to-amber-500/10' },
    { name: 'Korean', icon: '🍚', bg: 'from-indigo-500/10 to-purple-500/10' },
    { name: 'Mediterranean', icon: '🥗', bg: 'from-blue-500/10 to-cyan-500/10' },
    { name: 'American', icon: '🍔', bg: 'from-amber-500/10 to-yellow-500/10' },
    { name: 'French', icon: '🥐', bg: 'from-purple-500/10 to-indigo-500/10' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/70 via-amber-50/30 to-stone-50/50 dark:from-amber-950/20 dark:via-stone-900/40 dark:to-stone-950 pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-200/50 dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            Explore 1,000+ Curated Chef Recipes
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-[1.1]">
            Cook with Passion. <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500 bg-clip-text text-transparent">
              Eat with Delight.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover mouthwatering dishes, search recipes by available ingredients, adjust servings dynamically, and follow interactive step-by-step cooking timers.
          </p>

          {/* Interactive Search Bar in Hero with Live Autocomplete Suggestions */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex items-center gap-2 p-1.5 sm:p-2 bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200/90 dark:border-stone-800"
          >
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearchSubmit}
              placeholder="Search recipes, dishes, or ingredients (e.g. butter chicken, pasta, garlic)..."
              className="flex-1"
              inputClassName="border-0 bg-transparent py-3 sm:py-3.5 focus:ring-0 text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
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
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Popular:</span>
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
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-stone-800/80 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-900 dark:hover:text-amber-200 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">Explore by Cuisine</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Taste authentic culinary traditions from around the globe</p>
          </div>
          <Link
            to="/recipes"
            className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
          >
            All Cuisines &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-4">
          {cuisines.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => navigate(`/recipes?cuisine=${encodeURIComponent(c.name)}`)}
              className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500 hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Community Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">Trending & Featured Recipes</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">The most loved, highly-rated dishes by home chefs this week</p>
          </div>
          <Link
            to="/recipes?sort=rating"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-sm transition-colors self-start sm:self-auto"
          >
            <span>View All Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-stone-200/70 dark:bg-stone-800/70 animate-pulse" />
            ))}
          </div>
        ) : featuredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
            <UtensilsCrossed className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-stone-600 dark:text-stone-400 font-medium">No recipes loaded yet.</p>
          </div>
        )}
      </section>

      {/* Recommended For You Section */}
      {recommendedRecipes.length > 0 && (
        <section className="py-12 bg-amber-50/50 dark:bg-stone-900/40 border-y border-amber-200/50 dark:border-stone-800 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  Tailored Picks
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">Recommended For You</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Dishes tailored to your favorite cuisines and cooking tastes</p>
              </div>
              <Link
                to="/recipes"
                className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
            Everything You Need to Master Any Recipe
          </h2>
          <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-2">
            Engineered from the ground up for seamless, delightful home cooking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-6">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Smart Serving Adjuster</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Cooking for 2 or hosting 8? Adjust servings with one click and ingredient quantities dynamically recalculate in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-6">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">1-Click Shopping List</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Never forget an ingredient at the grocery store. Add recipe ingredients directly to your interactive checklist with ease.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Interactive Cooking Timers</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
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

      {/* Social Media & Community Connection Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Share2 className="w-3.5 h-3.5" />
            Stay Connected
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Connect With Our Culinary Community
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
            Follow our daily cooking reels, discover seasonal ingredient guides, and connect with fellow home chefs worldwide.
          </p>
        </div>

        {/* Social Media Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {/* Card 1: Instagram */}
          <a
            href="https://instagram.com/recipehaven"
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-pink-300 dark:hover:border-pink-800 transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300">
                  @recipehaven
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                Instagram Reels & Stories
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Watch quick 30-second recipe prep videos, plated dish photos, and seasonal ingredients.
              </p>
            </div>
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1 group-hover:underline">
              Follow on Instagram →
            </span>
          </a>

          {/* Card 2: YouTube */}
          <a
            href="https://youtube.com/@recipehaven"
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-red-300 dark:hover:border-red-800 transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                  RecipeHaven Kitchen
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                YouTube Masterclasses
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                In-depth culinary masterclasses, knife technique guides, and complete dinner walkthroughs.
              </p>
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 group-hover:underline">
              Subscribe Channel →
            </span>
          </a>

          {/* Card 3: X / Twitter */}
          <a
            href="https://twitter.com/recipehaven"
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-stone-400 dark:hover:border-stone-700 transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  @RecipeHavenApp
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                X (Twitter) Food Trends
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Join live kitchen discussions, quick ingredient swaps, and community polls on trending dishes.
              </p>
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1 group-hover:underline">
              Follow on X →
            </span>
          </a>

          {/* Card 4: Facebook Community */}
          <a
            href="https://facebook.com/recipehaven"
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                  RecipeHaven Club
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Facebook Community
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Connect with 50,000+ passionate food lovers, exchange recipes, and share your weeknight meal photos.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
              Join Community →
            </span>
          </a>

          {/* Card 5: GitHub Codebase */}
          <a
            href="https://github.com/Arshad-010/Food-Recipe-Application"
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-700/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                  Open Source
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                GitHub Repository
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Contribute features, report issues, and star our full-stack food recipe application repository.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:underline">
              Star on GitHub →
            </span>
          </a>

          {/* Card 6: Direct Email Support */}
          <a
            href="mailto:contact@recipehaven.com"
            className="group p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                  Direct Support
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Email Our Kitchen Desk
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Have culinary inquiries, collaboration requests, or recipe feedback? We reply within 24 hours.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
              contact@recipehaven.com →
            </span>
          </a>
        </div>

        {/* Legal Policies Banner (Terms & Privacy Reassurance) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 dark:bg-stone-900/80 border border-amber-300/40 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-stone-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Trusted, Safe & Community-Driven Cooking
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              We protect your privacy and ensure transparent terms for all shared recipes and culinary contributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/terms"
              className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs shadow-2xs hover:border-amber-400 transition-all inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Terms & Conditions</span>
            </Link>
            <Link
              to="/privacy"
              className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs shadow-2xs hover:border-emerald-400 transition-all inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy Policy</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
