import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Cookie,
  UserCheck,
  ArrowLeft,
  Mail,
  KeyRound,
  FileCheck,
} from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = 'October 6, 2026';

  const sections = [
    {
      id: 'collection',
      icon: Database,
      title: '1. Information We Collect',
      content: (
        <>
          <p>
            At RecipeHaven, we believe in collecting only the data necessary to provide you with an
            exceptional and personalized cooking experience:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-stone-600 dark:text-stone-300">
            <li>
              <strong>Account Profile Data:</strong> When registering, we collect your name, email
              address, optional bio, cooking preferences (dietary restrictions, preferred cuisines),
              and profile avatar.
            </li>
            <li>
              <strong>Culinary & Community Contributions:</strong> Recipes, ingredient lists,
              preparation times, photos, video links, ratings, reviews, and favorites you save.
            </li>
            <li>
              <strong>Interactive Features:</strong> Dynamic serving adjustments and items added to
              your smart grocery shopping list.
            </li>
            <li>
              <strong>Technical Telemetry:</strong> Anonymized browser type, IP address, and general
              session logs to optimize site performance and prevent abuse.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'usage',
      icon: Eye,
      title: '2. How We Use Your Information',
      content: (
        <>
          <p>We utilize your information to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li>Personalize your recipe feed and recommend dishes based on your preferred cuisines.</li>
            <li>Enable you to publish, edit, bookmark, and share recipes with the community.</li>
            <li>Maintain your persistent grocery shopping checklist across devices.</li>
            <li>Send essential transactional notifications (such as OTP verification and password reset requests).</li>
            <li>Protect our platform against spam, fraud, and security vulnerabilities.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'authentication',
      icon: KeyRound,
      title: '3. Google OAuth & Firebase Authentication',
      content: (
        <>
          <p>
            RecipeHaven offers convenient 1-click authentication via Google and Firebase.
          </p>
          <p className="mt-2">
            When you sign in using Google, Firebase securely authenticates your identity. We receive
            only your verified email address, full name, and public profile picture. <strong>We
            never have access to your Google account password</strong>, personal Google Drive files,
            or contact lists. All tokens are cryptographically validated by our backend servers.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: '4. Cookies & Local Storage',
      content: (
        <>
          <p>
            We use browser Local Storage and minimal essential session cookies to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li>Keep you logged in securely between browser sessions.</li>
            <li>Persist your visual display preferences (such as Light Mode or Dark Mode).</li>
            <li>Temporarily cache recent search queries for instant recipe autocomplete.</li>
          </ul>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            We do not use intrusive cross-site tracking cookies or sell your browsing history to advertising networks.
          </p>
        </>
      ),
    },
    {
      id: 'sharing',
      icon: Lock,
      title: '5. Data Protection & Third-Party Services',
      content: (
        <>
          <p>
            <strong>We do not sell, rent, or monetize your personal information to third parties.</strong>
          </p>
          <p className="mt-2">
            We only share data with trusted infrastructure providers required to operate RecipeHaven:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li><strong>MongoDB Atlas:</strong> Encrypted database storage for accounts and recipes.</li>
            <li><strong>Google Firebase:</strong> Industry-standard identity and token verification.</li>
            <li><strong>Cloudinary:</strong> High-performance media delivery for recipe photos.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      icon: UserCheck,
      title: '6. Your Rights & Data Controls',
      content: (
        <>
          <p>You have complete control over your culinary profile on RecipeHaven:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li><strong>Access & Update:</strong> Modify your name, bio, and preferences at any time in your Profile.</li>
            <li><strong>Recipe Management:</strong> Edit or delete your published recipes whenever you wish.</li>
            <li><strong>Account Deletion:</strong> You can request full deletion of your account and personal data by contacting us.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'contact',
      icon: Mail,
      title: '7. Contact Our Privacy Team',
      content: (
        <>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data rights,
            feel free to reach out to our privacy officer:
          </p>
          <div className="mt-3 p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-sm space-y-1">
            <p><strong>Email:</strong> <a href="mailto:privacy@recipehaven.com" className="text-amber-600 dark:text-amber-400 hover:underline">privacy@recipehaven.com</a></p>
            <p><strong>Support Desk:</strong> <a href="mailto:support@recipehaven.com" className="text-amber-600 dark:text-amber-400 hover:underline">support@recipehaven.com</a></p>
            <p><strong>Data Processing Location:</strong> Global Cloud Infrastructure</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-700 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden mb-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Your Privacy Matters
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Discover how we protect your personal information, recipes, and identity while you enjoy cooking with us.
          </p>
          <div className="text-xs text-emerald-200 pt-2">
            Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
          </div>
        </div>

        {/* Ambient Decorative element */}
        <div className="absolute -bottom-8 -right-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
        {sections.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className="px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-medium transition-colors"
          >
            {sec.title.split('. ')[1] || sec.title}
          </a>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <section
              key={sec.id}
              id={sec.id}
              className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                  {sec.title}
                </h2>
              </div>
              <div className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                {sec.content}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer cross-link */}
      <div className="mt-12 p-6 rounded-3xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-stone-900 dark:text-white text-sm">Need to review our terms?</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Read about our community guidelines and intellectual property in our Terms & Conditions.
          </p>
        </div>
        <Link
          to="/terms"
          className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          View Terms & Conditions
        </Link>
      </div>
    </div>
  );
}
