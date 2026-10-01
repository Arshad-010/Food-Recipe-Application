import React from 'react';
import { ChefHat, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">RecipeHaven</span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm">
              Discover, cook, and share unforgettable culinary experiences. Personalized recipe recommendations, step-by-step guidance, and interactive grocery planning.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><a href="/recipes" className="hover:text-amber-400 transition-colors">Popular Recipes</a></li>
              <li><a href="/recipes?mealType=Breakfast" className="hover:text-amber-400 transition-colors">Breakfast Delights</a></li>
              <li><a href="/recipes?cuisine=Italian" className="hover:text-amber-400 transition-colors">Italian Classics</a></li>
              <li><a href="/recipes?difficulty=Easy" className="hover:text-amber-400 transition-colors">Quick & Easy (Under 30 min)</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><a href="/register" className="hover:text-amber-400 transition-colors">Join as Chef</a></li>
              <li><a href="/create-recipe" className="hover:text-amber-400 transition-colors">Share a Recipe</a></li>
              <li><a href="/shopping-list" className="hover:text-amber-400 transition-colors">Smart Shopping List</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} RecipeHaven. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for passionate food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
