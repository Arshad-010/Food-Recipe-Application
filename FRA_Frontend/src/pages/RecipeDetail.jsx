import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Star,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  Play,
  RotateCcw,
  ShoppingBag,
  Flame,
  ChefHat,
  Sparkles,
  Edit,
  Trash2,
  MessageSquare,
  Copy,
  ExternalLink,
  Timer as TimerIcon,
  Utensils,
  ArrowLeft,
  CornerDownRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  Send,
  Loader2,
} from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YouTubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import RecipeCard from '../components/RecipeCard';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [similarRecipes, setSimilarRecipes] = useState([]);

  // Interactive Servings Scaler state
  const [servings, setServings] = useState(4);

  // Completed steps tracker
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Interactive Kitchen Timers state { [stepIndex]: { secondsLeft, isRunning, totalSeconds } }
  const [timers, setTimers] = useState({});

  // Favorites & Bookmarks state
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [favCount, setFavCount] = useState(0);

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Comment Form state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Nested Reply state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Share Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Chef Contact Modal & Form state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    senderName: '',
    senderEmail: '',
    subject: '',
    inquiryType: 'Recipe Question',
    message: '',
  });
  const [sendingContact, setSendingContact] = useState(false);

  // Sync logged in user details to contact form
  useEffect(() => {
    if (user) {
      setContactForm((prev) => ({
        ...prev,
        senderName: prev.senderName || user.name || '',
        senderEmail: prev.senderEmail || user.email || '',
      }));
    }
  }, [user]);

  // Fetch recipe details
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/recipes/${id}`);
        if (res.success && res.recipe) {
          const rec = res.recipe;
          setRecipe(rec);
          setServings(rec.servings || 4);
          setFavCount(rec.favoritesCount || 0);

          try {
            const raw = localStorage.getItem('recipehaven_recently_viewed');
            const list = raw ? JSON.parse(raw) : [];
            const filtered = list.filter((r) => (r._id || r) !== rec._id);
            const updated = [
              {
                _id: rec._id,
                title: rec.title,
                image: rec.image,
                cuisine: rec.cuisine,
                category: rec.category,
                cookTime: rec.cookTime,
                prepTime: rec.prepTime,
                difficulty: rec.difficulty,
                averageRating: rec.averageRating,
                ratingsCount: rec.ratingsCount,
                author: rec.author,
              },
              ...filtered,
            ].slice(0, 8);
            localStorage.setItem('recipehaven_recently_viewed', JSON.stringify(updated));
          } catch (e) {
            // ignore storage errors
          }

          if (user && user.favorites) {
            setIsFavorited(
              user.favorites.some((fav) =>
                typeof fav === 'string' ? fav === rec._id : fav._id === rec._id
              )
            );
          }
          if (user && user.bookmarks) {
            setIsBookmarked(
              user.bookmarks.some((b) =>
                typeof b === 'string' ? b === rec._id : b._id === rec._id
              )
            );
          }

          // Fetch recommendations and similar recipes in parallel
          const [recsRes, similarRes] = await Promise.all([
            api.get('/recipes/recommendations'),
            api.get(`/recipes/${id}/similar`),
          ]);

          if (recsRes.success) {
            setRecommended(
              (recsRes.recommendations || []).filter((r) => r._id !== rec._id).slice(0, 4)
            );
          }

          if (similarRes.success) {
            setSimilarRecipes(
              (similarRes.similar || []).filter((r) => r._id !== rec._id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user]);

  // Timer interval hook
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        let changed = false;
        const next = { ...prev };

        Object.keys(next).forEach((key) => {
          if (next[key].isRunning) {
            changed = true;
            if (next[key].secondsLeft > 1) {
              next[key] = { ...next[key], secondsLeft: next[key].secondsLeft - 1 };
            } else {
              next[key] = { ...next[key], secondsLeft: 0, isRunning: false, done: true };
              showToast(`Timer finished for Step ${Number(key) + 1}!`, 'success');
            }
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartTimer = (index, minutes) => {
    setTimers((prev) => {
      const current = prev[index];
      if (!current) {
        return {
          ...prev,
          [index]: {
            secondsLeft: minutes * 60,
            totalSeconds: minutes * 60,
            isRunning: true,
            done: false,
          },
        };
      }
      return {
        ...prev,
        [index]: {
          ...current,
          isRunning: true,
          done: false,
        },
      };
    });
  };

  const handlePauseTimer = (index) => {
    setTimers((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        isRunning: false,
      },
    }));
  };

  const handleResetTimer = (index, minutes) => {
    setTimers((prev) => ({
      ...prev,
      [index]: {
        secondsLeft: minutes * 60,
        totalSeconds: minutes * 60,
        isRunning: false,
        done: false,
      },
    }));
  };

  const toggleStepCompleted = (index) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to favorite this recipe', 'info');
      navigate('/login');
      return;
    }
    try {
      const nextState = !isFavorited;
      setIsFavorited(nextState);
      setFavCount((p) => (nextState ? p + 1 : Math.max(0, p - 1)));

      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      setIsFavorited(!isFavorited);
      setFavCount((p) => (isFavorited ? p + 1 : Math.max(0, p - 1)));
      showToast(err.message, 'error');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save bookmarks', 'info');
      navigate('/login');
      return;
    }
    try {
      const nextState = !isBookmarked;
      setIsBookmarked(nextState);

      const res = await api.post(`/recipes/${recipe._id}/bookmark`);
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      setIsBookmarked(!isBookmarked);
      showToast(err.message, 'error');
    }
  };

  const handleAddAllToShoppingList = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to manage your shopping list', 'info');
      navigate('/login');
      return;
    }

    try {
      const scale = servings / (recipe.servings || 4);
      const items = recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity ? (ing.quantity * scale).toFixed(1).replace(/\.0$/, '') : '',
        unit: ing.unit,
        recipeTitle: recipe.title,
        recipeId: recipe._id,
      }));

      const res = await api.post('/shopping-list/add', { items });
      if (res.success) {
        showToast(`Added ${items.length} ingredients to your Shopping List!`, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddSingleIngredient = async (ing) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add to your shopping list', 'info');
      navigate('/login');
      return;
    }

    try {
      const scale = servings / (recipe.servings || 4);
      const item = {
        name: ing.name,
        quantity: ing.quantity ? (ing.quantity * scale).toFixed(1).replace(/\.0$/, '') : '',
        unit: ing.unit,
        recipeTitle: recipe.title,
        recipeId: recipe._id,
      };

      const res = await api.post('/shopping-list/add', { items: [item] });
      if (res.success) {
        showToast(`Added "${ing.name}" to your Shopping List`, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to leave a review', 'info');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      showToast('Please write a brief review', 'info');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/recipes/${recipe._id}/reviews`, {
        rating: userRating,
        comment: reviewComment,
      });

      if (res.success) {
        showToast('Thank you for your rating and review!', 'success');
        setRecipe((prev) => ({
          ...prev,
          reviews: res.reviews,
          averageRating: res.averageRating,
          ratingsCount: res.ratingsCount,
        }));
        setReviewComment('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review for this recipe?')) return;
    try {
      const res = await api.delete(`/recipes/${recipe._id}/reviews/${reviewId}`);
      if (res.success) {
        showToast('Review removed', 'success');
        setRecipe((prev) => ({
          ...prev,
          reviews: res.reviews,
          averageRating: res.averageRating,
          ratingsCount: res.ratingsCount,
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to post a comment', 'info');
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/recipes/${recipe._id}/comments`, {
        text: commentText,
      });

      if (res.success) {
        showToast('Comment posted', 'success');
        setRecipe((prev) => ({
          ...prev,
          comments: res.comments,
        }));
        setCommentText('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/recipes/${recipe._id}/comments/${commentId}`);
      if (res.success) {
        showToast('Comment deleted', 'success');
        setRecipe((prev) => ({
          ...prev,
          comments: res.comments,
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!isAuthenticated) {
      showToast('Please sign in to reply', 'info');
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await api.post(`/recipes/${recipe._id}/comments/${commentId}/replies`, {
        text: replyText.trim(),
      });
      if (res.success) {
        showToast('Reply posted', 'success');
        setRecipe((prev) => ({ ...prev, comments: res.comments }));
        setReplyText('');
        setActiveReplyId(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const res = await api.delete(`/recipes/${recipe._id}/comments/${commentId}/replies/${replyId}`);
      if (res.success) {
        showToast('Reply deleted', 'success');
        setRecipe((prev) => ({ ...prev, comments: res.comments }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };


  const handleDeleteRecipe = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await api.delete(`/recipes/${recipe._id}`);
      if (res.success) {
        showToast('Recipe deleted successfully', 'success');
        navigate('/recipes');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Recipe link copied to clipboard!', 'success');
    setShareModalOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 w-full animate-pulse space-y-6">
        <div className="h-96 rounded-3xl bg-stone-200" />
        <div className="h-10 w-2/3 bg-stone-200 rounded-xl" />
        <div className="h-6 w-1/3 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <Utensils className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-stone-900">Recipe Not Found</h2>
        <p className="text-stone-500 mt-2">The recipe you requested may have been deleted or is unavailable.</p>
        <Link
          to="/recipes"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recipes
        </Link>
      </div>
    );
  }

  const isOwner = user && recipe.author && (user._id === recipe.author._id || user._id === recipe.author);
  const canEdit = isOwner || isAdmin;
  const scale = servings / (recipe.servings || 4);

  // Chef details & fallback normalization
  const chef = recipe.author && typeof recipe.author === 'object' ? recipe.author : {};
  const chefName = chef.name || recipe.authorName || 'Chef';
  const chefAvatar = chef.avatar || recipe.authorAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80';
  const chefBio = chef.bio || 'Passionate culinary creator dedicated to sharing fresh, authentic recipes and handcrafted flavors.';
  const chefEmail = recipe.authorContact?.email || chef.contactEmail || chef.email || 'chef@recipehaven.com';
  const chefPhone = recipe.authorContact?.phone || chef.phoneNumber || '';
  const chefLocation = recipe.authorContact?.location || chef.location || '';
  const chefInstagram = recipe.authorContact?.instagram || chef.instagram || '';
  const chefWebsite = recipe.authorContact?.website || chef.website || '';

  const copyChefContact = () => {
    const details = `Chef: ${chefName}\nEmail: ${chefEmail}${chefPhone ? `\nPhone: ${chefPhone}` : ''}${chefLocation ? `\nLocation: ${chefLocation}` : ''}${chefInstagram ? `\nInstagram: ${chefInstagram}` : ''}${chefWebsite ? `\nWebsite: ${chefWebsite}` : ''}`;
    navigator.clipboard.writeText(details);
    showToast(`Chef ${chefName}'s contact details copied to clipboard!`, 'success');
  };

  const handleSendChefMessage = (e) => {
    e.preventDefault();
    if (!contactForm.message.trim() || !contactForm.senderEmail.trim()) {
      showToast('Please provide your email and message', 'error');
      return;
    }
    setSendingContact(true);
    setTimeout(() => {
      setSendingContact(false);
      setContactModalOpen(false);
      showToast(
        `Your message has been sent to Chef ${chefName}! They will respond to ${contactForm.senderEmail}.`,
        'success'
      );
      setContactForm({
        senderName: user?.name || '',
        senderEmail: user?.email || '',
        subject: '',
        inquiryType: 'Recipe Question',
        message: '',
      });
    }, 600);
  };

  // YouTube embed parser supporting all URL formats
  const getEmbedVideoUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/embed/')) return url;
      const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
      const longMatch = url.match(/(?:youtube\.com\/(?:watch\?.*v=|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
      if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
      if (url.includes('player.vimeo.com')) return url;
      return url;
    } catch {
      return url;
    }
  };

  const getYouTubeWatchUrl = () => {
    if (recipe.videoUrl && (recipe.videoUrl.includes('youtube.com') || recipe.videoUrl.includes('youtu.be'))) {
      return recipe.videoUrl;
    }
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' recipe step by step')}`;
  };

  const embedVideo = getEmbedVideoUrl(recipe.videoUrl);
  const youtubeWatchUrl = getYouTubeWatchUrl();

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <Link
        to="/recipes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Recipes</span>
      </Link>

      {/* Main Recipe Card Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden mb-12">
        {/* Hero Image / Video Section */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-stone-950">
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80'}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

          {/* Badges on Hero */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-xs font-bold text-stone-900 shadow-sm">
              {recipe.cuisine}
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-sm">
              {recipe.mealType}
            </span>
            <span className="px-3 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              {recipe.difficulty}
            </span>
          </div>

          {/* Right Floating Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className={`p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md cursor-pointer ${
                isFavorited
                  ? 'bg-rose-500 text-white scale-105'
                  : 'bg-white/90 text-stone-700 hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500 text-white scale-105'
                  : 'bg-white/90 text-stone-700 hover:bg-white hover:text-amber-500'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-stone-700 hover:bg-white hover:text-amber-600 transition-all shadow-md cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Title and Direct YouTube Watch Button on Hero Bottom */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-md">
              {recipe.title}
            </h1>
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all shrink-0 cursor-pointer w-fit transform hover:-translate-y-0.5 active:translate-y-0"
              title="Watch full step-by-step video process on YouTube"
            >
              <YouTubeIcon className="w-4 h-4 text-white" />
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Metadata Row: Prep, Cook, Total Time, Calories, Rating */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Prep Time</span>
              <span className="text-lg font-extrabold text-stone-900 mt-0.5">{recipe.prepTime || 10}m</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Cook Time</span>
              <span className="text-lg font-extrabold text-stone-900 mt-0.5">{recipe.cookTime || 15}m</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Total Time</span>
              <span className="text-lg font-extrabold text-amber-700 mt-0.5">
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Calories</span>
              <span className="text-lg font-extrabold text-stone-900 mt-0.5">
                {recipe.caloriesPerServing ? `${recipe.caloriesPerServing} kcal` : 'Fresh'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-2 border-t sm:border-t-0 sm:border-l border-amber-200">
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Community</span>
              <div className="flex items-center gap-1 mt-0.5 text-amber-600 font-extrabold text-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{recipe.averageRating ? recipe.averageRating.toFixed(1) : '5.0'}</span>
                <span className="text-xs text-stone-400 font-normal">({recipe.ratingsCount || 1})</span>
              </div>
            </div>
          </div>

          {/* Description & Author info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="space-y-3 max-w-2xl">
              <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
                {recipe.description}
              </p>
              {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recipe.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
                    >
                      🌱 {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 shrink-0">
              <img
                src={chefAvatar}
                alt={chefName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80';
                }}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs text-stone-500 font-medium">Recipe created by</p>
                <p className="font-bold text-stone-900 text-sm">{chefName}</p>
                <span className="text-[11px] text-amber-700 font-semibold">Master Culinary Contributor</span>
              </div>

              <div className="ml-2 pl-3 border-l border-stone-200 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('chef-contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else setContactModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Contact Chef"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Contact</span>
                </button>

                {canEdit && (
                  <>
                    <Link
                      to={`/edit-recipe/${recipe._id}`}
                      className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-white rounded-xl transition-colors"
                      title="Edit Recipe"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleDeleteRecipe}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Video Section */}
          {(embedVideo || recipe.videoUrl) && (
            <div id="recipe-video" className="p-6 sm:p-8 rounded-3xl bg-stone-950 text-white space-y-4 shadow-xl border border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <YouTubeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-white">
                      Step-by-Step Cooking Video
                    </h3>
                    <p className="text-xs text-stone-400">
                      Watch the complete recipe demonstration and chef preparation
                    </p>
                  </div>
                </div>

                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md self-start sm:self-auto cursor-pointer"
                  title="Open in YouTube (new tab)"
                >
                  <YouTubeIcon className="w-4 h-4 text-white" />
                  <span>Open in YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {embedVideo ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-inner">
                  {embedVideo.includes('youtube.com/embed') || embedVideo.includes('player.vimeo.com') ? (
                    <iframe
                      src={embedVideo}
                      title={`${recipe.title} - Step-by-Step Cooking Video`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      src={recipe.videoUrl}
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support HTML5 video streaming.
                    </video>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Two-Column Layout: Ingredients & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
            {/* Left Column: Ingredients with Servings Adjuster */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-stone-50/80 border border-stone-200/90 shadow-2xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-stone-900">Ingredients</h3>
                  <span className="text-xs font-semibold text-stone-500">
                    {recipe.ingredients.length} items
                  </span>
                </div>

                {/* Servings Adjuster */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Adjust Servings:
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.max(1, s - 1))}
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-base text-amber-700 min-w-8 text-center">
                      {servings}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.min(24, s + 1))}
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ingredients Checklist */}
                <ul className="divide-y divide-stone-200/80 space-y-1">
                  {recipe.ingredients.map((ing, idx) => {
                    const scaledQty = ing.quantity
                      ? (ing.quantity * scale).toFixed(1).replace(/\.0$/, '')
                      : '';
                    return (
                      <li
                        key={idx}
                        className="py-3 flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <div>
                            <span className="text-sm font-semibold text-stone-900">
                              {scaledQty && (
                                <span className="font-bold text-amber-800 mr-1.5">
                                  {scaledQty} {ing.unit}
                                </span>
                              )}
                              {ing.name}
                            </span>
                            {ing.notes && (
                              <p className="text-xs text-stone-500 italic mt-0.5">{ing.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Add single ingredient button */}
                        <button
                          type="button"
                          onClick={() => handleAddSingleIngredient(ing)}
                          title="Add to Shopping List"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Add All to Shopping List Button */}
                <button
                  type="button"
                  onClick={handleAddAllToShoppingList}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add All to Shopping List</span>
                </button>
              </div>
            </div>

            {/* Right Column: Step-by-Step Cooking Instructions */}
            <div className="lg:col-span-7 space-y-6">
              {/* YouTube Video Banner for Step-by-Step Instructions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-50/70 border border-red-200/80 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <YouTubeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Step-by-Step YouTube Process</span>
                      <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">Video</span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Follow the visual chef techniques step-by-step
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {embedVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('recipe-video');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200 transition-colors shadow-2xs cursor-pointer"
                    >
                      Jump to Video
                    </button>
                  )}
                  <a
                    href={youtubeWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Cooking Instructions</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Click checkboxes to mark steps completed as you cook
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  {completedSteps.size} of {recipe.instructions.length} Done
                </span>
              </div>

              <div className="space-y-4">
                {recipe.instructions.map((step, idx) => {
                  const isDone = completedSteps.has(idx);
                  const timer = timers[idx];
                  const hasTimer = Boolean(step.timerMinutes && step.timerMinutes > 0);

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-3xl border transition-all ${
                        isDone
                          ? 'bg-stone-50/70 border-stone-200 opacity-60'
                          : 'bg-white border-stone-200/90 shadow-xs hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1">
                          {/* Step Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleStepCompleted(idx)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : 'border-2 border-stone-300 hover:border-amber-500 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                              Step {step.stepNumber || idx + 1}: {step.title}
                            </span>
                            <p
                              className={`text-sm leading-relaxed ${
                                isDone ? 'line-through text-stone-500' : 'text-stone-800'
                              }`}
                            >
                              {step.instruction}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Step Timer (if minutes configured) */}
                      {hasTimer && (
                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between bg-amber-50/50 p-3 rounded-2xl">
                          <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
                            <TimerIcon className="w-4 h-4 text-amber-600" />
                            <span>Recommended Timer: {step.timerMinutes} mins</span>
                            {timer?.secondsLeft !== undefined && (
                              <span
                                className={`font-mono text-sm font-bold ml-2 ${
                                  timer.done
                                    ? 'text-emerald-700 animate-pulse'
                                    : 'text-amber-800'
                                }`}
                              >
                                {Math.floor(timer.secondsLeft / 60)}:
                                {String(timer.secondsLeft % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {timer?.isRunning ? (
                              <button
                                type="button"
                                onClick={() => handlePauseTimer(idx)}
                                className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                              >
                                Pause
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartTimer(idx, step.timerMinutes)}
                                className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                              >
                                {timer?.secondsLeft ? 'Resume' : 'Start'}
                              </button>
                            )}

                            {timer && (
                              <button
                                type="button"
                                onClick={() => handleResetTimer(idx, step.timerMinutes)}
                                className="p-1 rounded-xl text-stone-500 hover:text-stone-800 cursor-pointer"
                                title="Reset Timer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Meet & Contact the Chef Section */}
          <div id="chef-contact" className="pt-10 border-t border-stone-200/80">
            <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -mr-28 -mt-28 pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                {/* Left: Chef Avatar and Bio Details */}
                <div className="flex items-start sm:items-center gap-5 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={chefAvatar}
                      alt={chefName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80';
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-100 shadow-md"
                    />
                    <span
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white"
                      title="Verified Culinary Creator"
                    >
                      <ChefHat className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                        Recipe Creator & Chef
                      </span>
                      {chefLocation && (
                        <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>{chefLocation}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      {chefName}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
                      {chefBio}
                    </p>

                    {/* Contact Badges & Handles */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600">
                      {chefEmail && (
                        <a
                          href={`mailto:${chefEmail}?subject=${encodeURIComponent(
                            `Inquiry about recipe: ${recipe.title}`
                          )}`}
                          className="inline-flex items-center gap-1.5 text-stone-700 hover:text-amber-700 font-medium transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-600" />
                          <span>{chefEmail}</span>
                        </a>
                      )}

                      {chefPhone && (
                        <a
                          href={`tel:${chefPhone}`}
                          className="inline-flex items-center gap-1.5 text-stone-700 hover:text-amber-700 font-medium transition-colors"
                          title="Call or WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{chefPhone}</span>
                        </a>
                      )}

                      {chefInstagram && (
                        <a
                          href={`https://instagram.com/${chefInstagram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-stone-700 hover:text-amber-700 font-medium transition-colors"
                        >
                          <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
                          <span>{chefInstagram.startsWith('@') ? chefInstagram : `@${chefInstagram}`}</span>
                        </a>
                      )}

                      {chefWebsite && (
                        <a
                          href={chefWebsite.startsWith('http') ? chefWebsite : `https://${chefWebsite}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-stone-700 hover:text-amber-700 font-medium transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-sky-600" />
                          <span>Portfolio / Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:shadow cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Contact Chef</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${chefEmail}?subject=${encodeURIComponent(
                        `Inquiry regarding ${recipe.title}`
                      )}&body=${encodeURIComponent(
                        `Hi ${chefName},\n\nI was looking at your "${recipe.title}" recipe on RecipeHaven and wanted to get in touch!\n\nBest regards,\n${user?.name || ''}`
                      )}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 font-semibold text-xs transition-colors shadow-2xs"
                      title="Open default email application"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>Email Client</span>
                    </a>

                    <button
                      type="button"
                      onClick={copyChefContact}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title="Copy contact details to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy Info</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings & Reviews Section */}
          <div className="pt-10 border-t border-stone-200/80 space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-stone-900">Ratings & Community Reviews</h3>
              <p className="text-sm text-stone-500 mt-1">
                Share your cooking experience and tips with other home chefs.
              </p>
            </div>

            {/* Leave a review form */}
            <form
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200/80 space-y-4"
            >
              <h4 className="font-bold text-stone-900 text-sm">Leave a Rating & Review</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 ml-2">
                  {userRating} / 5 Stars
                </span>
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you think of this recipe? Did you make any fun substitutions? How was the texture?"
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {recipe.reviews && recipe.reviews.length > 0 ? (
                recipe.reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-xs text-stone-900">{rev.userName}</p>
                          <p className="text-[10px] text-stone-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                        {(user && (user._id === rev.user || isAdmin)) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev._id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete your review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed font-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic">No reviews yet. Be the first to cook and review!</p>
              )}
            </div>
          </div>

          {/* Comments & Discussions with Nested Replies */}
          <div className="pt-8 border-t border-stone-200/80 space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <h3 className="text-xl font-bold text-stone-900">Questions & Discussions</h3>
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question or share a tip about this recipe..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Post
              </button>
            </form>

            <div className="space-y-4">
              {recipe.comments && recipe.comments.length > 0 ? (
                recipe.comments.map((comm) => (
                  <div
                    key={comm._id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={comm.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={comm.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 mr-2">{comm.userName}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                          <p className="text-xs text-stone-700 mt-1">{comm.text}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(activeReplyId === comm._id ? null : comm._id)}
                          className="text-xs text-amber-700 hover:text-amber-900 font-bold px-2 py-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                        {(user?._id === comm.user || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comm._id)}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Reply Form */}
                    {activeReplyId === comm._id && (
                      <div className="pl-6 sm:pl-8 flex items-center gap-2 pt-2 border-t border-stone-200">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comm.userName}...`}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={submittingReply}
                          onClick={() => handleReplySubmit(comm._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyId(null);
                            setReplyText('');
                          }}
                          className="px-2 py-1.5 text-stone-400 hover:text-stone-600 text-xs font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Nested Replies List */}
                    {comm.replies && comm.replies.length > 0 && (
                      <div className="pl-6 sm:pl-9 space-y-2 pt-1 border-t border-stone-150">
                        {comm.replies.map((rep) => (
                          <div
                            key={rep._id}
                            className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-start gap-2">
                              <CornerDownRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <img
                                src={rep.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                alt={rep.userName}
                                className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-[11px] text-stone-900 mr-2">{rep.userName}</span>
                                <span className="text-[9px] text-stone-400">
                                  {new Date(rep.createdAt).toLocaleDateString()}
                                </span>
                                <p className="text-xs text-stone-700 mt-0.5">{rep.text}</p>
                              </div>
                            </div>

                            {(user?._id === rep.user || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReply(comm._id, rep._id)}
                                className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Delete reply"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Recipes Grid */}
      {similarRecipes.length > 0 && (
        <div className="space-y-6 pt-4 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-stone-900">Similar Recipes You'll Love</h3>
              <p className="text-xs text-stone-500 mt-0.5">Dishes matching this cuisine, meal type, and dietary profile.</p>
            </div>
            <Link
              to="/recipes"
              className="text-sm font-bold text-amber-700 hover:text-amber-800"
            >
              Explore All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarRecipes.map((rec) => (
              <RecipeCard key={rec._id} recipe={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Recipes Grid at Bottom */}
      {recommended.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-stone-900">Recommended for You</h3>
              <p className="text-xs text-stone-500 mt-0.5">Handpicked chef creations based on community ratings.</p>
            </div>
            <Link
              to="/recipes"
              className="text-sm font-bold text-amber-700 hover:text-amber-800"
            >
              Explore More &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((rec) => (
              <RecipeCard key={rec._id} recipe={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Share Recipe Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-stone-900">Share This Recipe</h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Share "{recipe.title}" with your friends, family, or social media!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out this delicious recipe for ${recipe.title}: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-2 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Cooking ${recipe.title} with RecipeHaven!`
                )}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-sky-50 text-sky-800 hover:bg-sky-100 flex items-center justify-center gap-2 transition-colors"
              >
                Twitter / X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-blue-50 text-blue-800 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
              >
                Facebook
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `Delicious Recipe: ${recipe.title}`
                )}&body=${encodeURIComponent(
                  `Hey, check out this great recipe for ${recipe.title} on RecipeHaven:\n\n${window.location.href}`
                )}`}
                className="p-3 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors"
              >
                Email
              </a>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-stone-50 border border-stone-200">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="w-full bg-transparent text-xs text-stone-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Chef Inquiry Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-stone-200 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={chefAvatar}
                  alt={chefName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-200"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900 leading-tight">
                    Contact Chef {chefName}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Regarding: <span className="font-semibold text-amber-800">"{recipe.title}"</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendChefMessage} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.senderName}
                    onChange={(e) => setContactForm({ ...contactForm, senderName: e.target.value })}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.senderEmail}
                    onChange={(e) => setContactForm({ ...contactForm, senderEmail: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={contactForm.inquiryType}
                  onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                >
                  <option value="Recipe Question">Recipe Question & Ingredient Substitutions</option>
                  <option value="Cooking Class">Private Cooking Class / Mentorship</option>
                  <option value="Catering / Event">Catering, Events & Private Dining</option>
                  <option value="Collaboration">Culinary Collaboration / Sponsorship</option>
                  <option value="Compliment">Compliment & Culinary Appreciation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder={`Write your message for Chef ${chefName}...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${chefEmail}?subject=${encodeURIComponent(
                    `[${contactForm.inquiryType}] ${recipe.title}`
                  )}&body=${encodeURIComponent(contactForm.message)}`}
                  className="text-xs text-stone-500 hover:text-amber-700 font-medium inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open via Mail App</span>
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingContact}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {sendingContact ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
