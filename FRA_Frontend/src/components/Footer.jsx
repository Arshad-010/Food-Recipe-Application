import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Heart,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@recipehaven',
      href: 'https://instagram.com/recipehaven',
      color: 'hover:text-pink-400 hover:border-pink-500/50 hover:bg-pink-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      handle: 'RecipeHaven Kitchen',
      href: 'https://youtube.com/@recipehaven',
      color: 'hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      handle: '@RecipeHavenApp',
      href: 'https://twitter.com/recipehaven',
      color: 'hover:text-sky-400 hover:border-sky-500/50 hover:bg-sky-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      handle: 'RecipeHaven Official',
      href: 'https://facebook.com/recipehaven',
      color: 'hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      handle: 'Arshad-010 / Food-Recipe',
      href: 'https://github.com/Arshad-010/Food-Recipe-Application',
      color: 'hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main 4-column footer layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-800">
          {/* Col 1 & 2: Brand Info & Social Media Contacts */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                RecipeHaven
              </span>
            </Link>

            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              Discover, cook, and share unforgettable culinary experiences. Personalized recipe
              recommendations, step-by-step guidance, and interactive grocery planning.
            </p>

            {/* Social Media Contacts Bar */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Follow & Connect With Us
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    title={`${s.name} - ${s.handle}`}
                    className={`w-9 h-9 rounded-xl bg-stone-800/90 border border-stone-700/80 text-stone-300 flex items-center justify-center transition-all hover:scale-110 shadow-xs ${s.color}`}
                  >
                    {s.icon}
                  </a>
                ))}
                <a
                  href="mailto:contact@recipehaven.com"
                  title="Email Us: contact@recipehaven.com"
                  className="w-9 h-9 rounded-xl bg-stone-800/90 border border-stone-700/80 text-stone-300 flex items-center justify-center transition-all hover:scale-110 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Explore Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Explore Recipes
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/recipes" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Popular Recipes
                </Link>
              </li>
              <li>
                <Link to="/recipes?mealType=Breakfast" className="hover:text-amber-400 transition-colors">
                  Breakfast Delights
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Italian" className="hover:text-amber-400 transition-colors">
                  Italian Classics
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Indian" className="hover:text-amber-400 transition-colors">
                  Indian Spices
                </Link>
              </li>
              <li>
                <Link to="/recipes?difficulty=Easy" className="hover:text-amber-400 transition-colors">
                  Quick & Easy Under 30m
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/register" className="hover:text-amber-400 transition-colors">
                  Join as Home Chef
                </Link>
              </li>
              <li>
                <Link to="/create-recipe" className="hover:text-amber-400 transition-colors">
                  Share Your Recipe
                </Link>
              </li>
              <li>
                <Link to="/shopping-list" className="hover:text-amber-400 transition-colors">
                  Smart Shopping List
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-amber-400 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors">
                  Chef Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Help (Terms, Privacy, Contact) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li className="pt-2 text-xs text-stone-400 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <a href="mailto:support@recipehaven.com" className="hover:underline">
                    support@recipehaven.com
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>Global Culinary Network</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal quick links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p>© {currentYear} RecipeHaven. All rights reserved.</p>
            <span className="hidden sm:inline text-stone-700">•</span>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-stone-700">•</span>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
          </div>

          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for passionate food lovers worldwide.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
