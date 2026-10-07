import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  ChefHat,
  ArrowLeft,
  AlertTriangle,
  Scale,
  Users,
  CheckCircle2,
  Mail,
  HelpCircle,
} from 'lucide-react';

export default function TermsAndConditions() {
  const lastUpdated = 'October 6, 2026';

  const sections = [
    {
      id: 'acceptance',
      icon: Scale,
      title: '1. Acceptance of Terms',
      content: (
        <>
          <p>
            By accessing or using <strong>RecipeHaven</strong> (the &quot;Platform&quot;), including any
            associated websites, mobile views, APIs, and community tools, you agree to be bound
            by these Terms and Conditions (&quot;Terms&quot;). If you do not agree with any part of these
            terms, you must immediately discontinue use of the Platform.
          </p>
          <p className="mt-2">
            These Terms apply to all visitors, registered home chefs, culinary contributors, and
            anyone who browses or submits recipes through our services.
          </p>
        </>
      ),
    },
    {
      id: 'accounts',
      icon: Users,
      title: '2. User Accounts & Security',
      content: (
        <>
          <p>
            To unlock specific features—such as publishing recipes, bookmarking favorites, writing
            reviews, or syncing your interactive grocery shopping list—you may be required to create
            an account using your email or Google OAuth via Firebase.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li>You agree to provide accurate, up-to-date, and truthful registration information.</li>
            <li>You are solely responsible for preserving the confidentiality of your password.</li>
            <li>
              You must immediately notify RecipeHaven if you suspect unauthorized access or any
              security breach regarding your credentials.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'content',
      icon: ChefHat,
      title: '3. Recipe Submissions & Intellectual Property',
      content: (
        <>
          <p>
            RecipeHaven celebrates culinary creativity. When you submit recipes, cooking tips,
            photographs, or instructional videos to our Platform:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li>
              <strong>Ownership:</strong> You retain ownership and copyright of your original text,
              photos, and content.
            </li>
            <li>
              <strong>License to RecipeHaven:</strong> You grant RecipeHaven a worldwide, non-exclusive,
              royalty-free license to display, index, format, and share your recipe across our community.
            </li>
            <li>
              <strong>Originality Guarantee:</strong> You confirm that your submissions do not infringe
              upon third-party copyrights, trademarks, or proprietary trade secrets.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'safety',
      icon: AlertTriangle,
      title: '4. Food Safety, Allergens & Dietary Disclaimer',
      content: (
        <>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm leading-relaxed mb-3">
            <strong>Important Culinary Notice:</strong> Recipes and cooking instructions are shared
            by community members for recreational enjoyment and inspiration. Nutritional calculations
            and prep notes are estimates only.
          </div>
          <p>
            RecipeHaven cannot guarantee that recipes will be free of food allergens (such as nuts,
            dairy, gluten, or shellfish). Always exercise standard kitchen safety practices, verify
            cooking internal temperatures (e.g., poultry and meat safety), and cross-check
            ingredients if you have severe dietary restrictions or allergies.
          </p>
        </>
      ),
    },
    {
      id: 'conduct',
      icon: CheckCircle2,
      title: '5. Community Conduct & Prohibited Activities',
      content: (
        <>
          <p>To preserve a friendly, respectful culinary sanctuary, you agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 dark:text-stone-300">
            <li>Post spam, promotional advertising, or misleading commercial links in recipe comments.</li>
            <li>Upload abusive, defamatory, discriminatory, or inappropriate multimedia.</li>
            <li>Scrape, reverse-engineer, or maliciously overload our servers or APIs.</li>
            <li>Impersonate another chef, food blogger, or RecipeHaven administrator.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'termination',
      icon: ShieldCheck,
      title: '6. Termination of Access',
      content: (
        <>
          <p>
            We reserve the right to suspend or terminate accounts that repeatedly violate these Terms,
            engage in harmful conduct, or post fraudulent recipe content, without prior notice.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      icon: Mail,
      title: '7. Inquiries & Contact Details',
      content: (
        <>
          <p>
            If you have any questions or clarifications regarding these Terms and Conditions, please
            reach out to our legal and support team:
          </p>
          <div className="mt-3 p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-sm space-y-1">
            <p><strong>Email:</strong> <a href="mailto:support@recipehaven.com" className="text-amber-600 dark:text-amber-400 hover:underline">support@recipehaven.com</a></p>
            <p><strong>Platform:</strong> RecipeHaven Culinary Network</p>
            <p><strong>Response Time:</strong> Within 1–2 business days</p>
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
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden mb-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Please read these terms carefully before exploring or contributing delicious recipes on RecipeHaven.
          </p>
          <div className="text-xs text-amber-200 pt-2">
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
            className="px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 text-xs font-medium transition-colors"
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
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
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
          <h3 className="font-bold text-stone-900 dark:text-white text-sm">Have privacy questions?</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Learn how we handle your personal data and account details in our Privacy Policy.
          </p>
        </div>
        <Link
          to="/privacy"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          View Privacy Policy
        </Link>
      </div>
    </div>
  );
}
