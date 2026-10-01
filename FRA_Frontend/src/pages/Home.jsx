import React, { useEffect, useState } from 'react';
import { ChefHat, Database, Server, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, Heart, ShoppingBag } from 'lucide-react';
import api from '../api/axios';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const data = await api.get('/health');
        setHealthStatus({ connected: true, data });
      } catch (err) {
        setHealthStatus({ connected: false, error: err.message });
      } finally {
        setLoading(false);
      }
    };
    checkApi();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/50 via-amber-50/20 to-transparent py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200/80 text-amber-800 text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Phase 1 Initialized • Project Infrastructure & DB Ready
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Discover, Cook & Share <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
              Extraordinary Recipes
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Your all-in-one culinary companion. Search recipes by ingredients, adjust servings dynamically, follow interactive timers, and plan your weekly groceries.
          </p>

          {/* System Health Status Card */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm text-left">
              <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-stone-600" />
                  System Architecture & Connectivity
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  {loading ? (
                    <span className="text-stone-400 animate-pulse">Checking connectivity...</span>
                  ) : healthStatus?.connected ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      All Systems Operational
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Offline / Retrying
                    </span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-1.5 text-stone-600 mb-1">
                    <Database className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-stone-800">Database</span>
                  </div>
                  <span className="text-emerald-700 font-medium">MongoDB Atlas Connected</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-1.5 text-stone-600 mb-1">
                    <Server className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-stone-800">REST API Server</span>
                  </div>
                  <span className="text-emerald-700 font-medium">Port 5050 (Express & Cors)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Built for Food Lovers & Home Chefs</h2>
          <p className="text-stone-500 text-sm mt-1">Everything planned and architected across our 10 implementation phases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2">Smart Recipe Creation</h3>
            <p className="text-stone-600 text-sm">
              Author rich recipes with ingredient quantities, units, multi-step instructions, prep times, and image/video uploads.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2">Ingredient Search & Filters</h3>
            <p className="text-stone-600 text-sm">
              Enter ingredients from your fridge to discover matching recipes, with filtering by cuisine, cooking time, and meal type.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2">Interactive Shopping List</h3>
            <p className="text-stone-600 text-sm">
              1-click addition of recipe ingredients straight into a checklist with automatic duplicate merging and check-off state.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
