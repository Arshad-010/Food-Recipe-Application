const Recipe = require('../models/Recipe');
const User = require('../models/User');

/**
 * @desc Get all recipes with search, multi-filter, sorting and pagination
 * @route GET /api/recipes
 * @access Public
 */
const getRecipes = async (req, res, next) => {
  try {
    const {
      q,
      search,
      ingredient,
      cuisine,
      mealType,
      difficulty,
      maxTime,
      dietaryTag,
      foodType,
      featured,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };
    const searchTerm = q || search;

    // Search query by title, description, cuisine or ingredient
    if (searchTerm && searchTerm.trim()) {
      const regex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { cuisine: regex },
        { 'ingredients.name': regex },
      ];
    }

    // Specific ingredient filter
    if (ingredient && ingredient.trim()) {
      const ingRegex = new RegExp(ingredient.trim(), 'i');
      query['ingredients.name'] = ingRegex;
    }

    // Cuisine filter
    if (cuisine && cuisine !== 'All') {
      query.cuisine = new RegExp(`^${cuisine.trim()}$`, 'i');
    }

    // Meal type filter
    if (mealType && mealType !== 'All') {
      query.mealType = mealType;
    }

    // Food type filter (Veg / Non-Veg)
    if (foodType && foodType !== 'All') {
      if (foodType === 'Veg') {
        query.isVeg = true;
      } else if (foodType === 'Non-Veg') {
        query.isVeg = false;
      }
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Dietary tag filter
    if (dietaryTag && dietaryTag !== 'All') {
      query.dietaryTags = dietaryTag;
    }

    // Featured only
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Has Video only
    if (req.query.hasVideo === 'true') {
      query.videoUrl = { $exists: true, $ne: '' };
    }

    // Max cooking time filter
    if (maxTime && Number(maxTime) > 0) {
      // Look for recipes where prepTime + cookTime <= maxTime
      query.$expr = {
        $lte: [{ $add: ['$prepTime', '$cookTime'] }, Number(maxTime)],
      };
    }

    // Sorting criteria
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'rating') {
      sortOption = { averageRating: -1, ratingsCount: -1 };
    } else if (sort === 'popular') {
      sortOption = { favoritesCount: -1, averageRating: -1 };
    } else if (sort === 'time') {
      sortOption = { cookTime: 1, prepTime: 1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .populate('author', 'name avatar');

    // Prioritize recipes with active video access so they appear above
    recipes.sort((a, b) => {
      const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
      const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNum,
      recipes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single recipe by ID
 * @route GET /api/recipes/:id
 * @access Public
 */
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      'author',
      'name avatar bio role email contactEmail phoneNumber location instagram website'
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new recipe
 * @route POST /api/recipes
 * @access Private
 */
const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      cuisine,
      mealType,
      difficulty,
      prepTime,
      cookTime,
      servings,
      caloriesPerServing,
      dietaryTags,
      image,
      videoUrl,
      ingredients,
      instructions,
      isPublished,
    } = req.body;

    // Validate minimum items
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one ingredient is required',
      });
    }

    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one instruction step is required',
      });
    }

    const recipe = await Recipe.create({
      title,
      description,
      cuisine,
      mealType: mealType || 'Dinner',
      difficulty: difficulty || 'Medium',
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 25,
      servings: Number(servings) || 4,
      caloriesPerServing: Number(caloriesPerServing) || 0,
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      videoUrl: videoUrl || '',
      ingredients: ingredients.map((ing) => ({
        name: ing.name,
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit || '',
        notes: ing.notes || '',
      })),
      instructions: instructions.map((inst, index) => ({
        stepNumber: inst.stepNumber || index + 1,
        title: inst.title || `Step ${index + 1}`,
        instruction: inst.instruction,
        timerMinutes: Number(inst.timerMinutes) || 0,
      })),
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      authorContact: {
        email: req.user.contactEmail || req.user.email || '',
        phone: req.user.phoneNumber || '',
        location: req.user.location || '',
        instagram: req.user.instagram || '',
        website: req.user.website || '',
      },
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update recipe
 * @route PUT /api/recipes/:id
 * @access Private (Owner or Admin)
 */
const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check authorization: must be author or admin
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this recipe',
      });
    }

    // Apply allowed updates
    const updates = { ...req.body };
    delete updates.author;
    delete updates.reviews;
    delete updates.averageRating;
    delete updates.ratingsCount;

    recipe = await Recipe.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete recipe
 * @route DELETE /api/recipes/:id
 * @access Private (Owner or Admin)
 */
const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check authorization: must be author or admin
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this recipe',
      });
    }

    await recipe.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle favorite recipe
 * @route POST /api/recipes/:id/favorite
 * @access Private
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    const isFav = user.favorites.some((favId) => favId.toString() === recipe._id.toString());

    if (isFav) {
      user.favorites = user.favorites.filter((favId) => favId.toString() !== recipe._id.toString());
      recipe.favoritesCount = Math.max(0, (recipe.favoritesCount || 1) - 1);
    } else {
      user.favorites.push(recipe._id);
      recipe.favoritesCount = (recipe.favoritesCount || 0) + 1;
    }

    await user.save();
    await recipe.save();

    res.status(200).json({
      success: true,
      isFavorited: !isFav,
      favoritesCount: recipe.favoritesCount,
      message: !isFav ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle bookmark recipe
 * @route POST /api/recipes/:id/bookmark
 * @access Private
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks.some((bId) => bId.toString() === recipe._id.toString());

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((bId) => bId.toString() !== recipe._id.toString());
    } else {
      user.bookmarks.push(recipe._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked,
      message: !isBookmarked ? 'Recipe bookmarked' : 'Bookmark removed',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get user's favorites, bookmarks and created recipes
 * @route GET /api/recipes/my/collections
 * @access Private
 */
const getUserCollections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        populate: { path: 'author', select: 'name avatar' },
      })
      .populate({
        path: 'bookmarks',
        populate: { path: 'author', select: 'name avatar' },
      });

    const myRecipes = await Recipe.find({ author: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      favorites: user.favorites || [],
      bookmarks: user.bookmarks || [],
      myRecipes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add or update review and rating
 * @route POST /api/recipes/:id/reviews
 * @access Private
 */
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment cannot be empty',
      });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if user already reviewed
    const existingIndex = recipe.reviews.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex !== -1) {
      // Update existing review
      recipe.reviews[existingIndex].rating = numRating;
      recipe.reviews[existingIndex].comment = comment.trim();
      recipe.reviews[existingIndex].userName = req.user.name;
      recipe.reviews[existingIndex].userAvatar = req.user.avatar;
    } else {
      // Push new review
      recipe.reviews.unshift({
        user: req.user._id,
        userName: req.user.name,
        userAvatar: req.user.avatar,
        rating: numRating,
        comment: comment.trim(),
      });
    }

    // Recalculate average rating
    const totalRating = recipe.reviews.reduce((acc, item) => acc + item.rating, 0);
    recipe.ratingsCount = recipe.reviews.length;
    recipe.averageRating = recipe.ratingsCount > 0 ? Number((totalRating / recipe.ratingsCount).toFixed(1)) : 0;

    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      reviews: recipe.reviews,
      averageRating: recipe.averageRating,
      ratingsCount: recipe.ratingsCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete review and recalculate ratings
 * @route DELETE /api/recipes/:id/reviews/:reviewId
 * @access Private
 */
const deleteReview = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const review = recipe.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Must be review author or admin
    const isAuthor = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    review.deleteOne();

    if (recipe.reviews.length > 0) {
      const totalRating = recipe.reviews.reduce((acc, item) => acc + item.rating, 0);
      recipe.ratingsCount = recipe.reviews.length;
      recipe.averageRating = Number((totalRating / recipe.ratingsCount).toFixed(1));
    } else {
      recipe.ratingsCount = 0;
      recipe.averageRating = 0;
    }

    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      reviews: recipe.reviews,
      averageRating: recipe.averageRating,
      ratingsCount: recipe.ratingsCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add comment to recipe discussion
 * @route POST /api/recipes/:id/comments
 * @access Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
      });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    recipe.comments.unshift({
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text: text.trim(),
    });

    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Comment posted',
      comments: recipe.comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete comment from recipe
 * @route DELETE /api/recipes/:id/comments/:commentId
 * @access Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only comment author, recipe author, or admin can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isRecipeAuthor = recipe.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isRecipeAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    comment.deleteOne();
    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Comment removed',
      comments: recipe.comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add nested reply to comment
 * @route POST /api/recipes/:id/comments/:commentId/replies
 * @access Private
 */
const addCommentReply = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Parent comment not found' });
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push({
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text: text.trim(),
    });

    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Reply posted',
      comments: recipe.comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete reply from comment
 * @route DELETE /api/recipes/:id/comments/:commentId/replies/:replyId
 * @access Private
 */
const deleteCommentReply = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Parent comment not found' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const isReplyAuthor = reply.user.toString() === req.user._id.toString();
    const isRecipeAuthor = recipe.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReplyAuthor && !isRecipeAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reply' });
    }

    reply.deleteOne();
    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Reply deleted',
      comments: recipe.comments,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc Get personalized recipe recommendations
 * @route GET /api/recipes/recommendations
 * @access Public (Personalized if authenticated)
 */
const getRecommendations = async (req, res, next) => {
  try {
    let recommendations = [];
    const userId = req.user ? req.user._id : null;

    if (userId) {
      const user = await User.findById(userId);
      const favoriteCuisines = user.preferences?.cuisines || [];
      const diet = user.preferences?.dietType !== 'None' ? user.preferences.dietType : null;

      const filter = { isPublished: true, author: { $ne: userId } };
      if (favoriteCuisines.length > 0) {
        filter.cuisine = { $in: favoriteCuisines };
      }
      if (diet) {
        filter.dietaryTags = diet;
      }

      recommendations = await Recipe.find(filter)
        .sort({ averageRating: -1, favoritesCount: -1 })
        .limit(8)
        .populate('author', 'name avatar');
    }

    // If no personalized matches found or guest user, fallback to top-rated recipes
    if (recommendations.length < 4) {
      const fallback = await Recipe.find({ isPublished: true })
        .sort({ averageRating: -1, favoritesCount: -1, createdAt: -1 })
        .limit(8)
        .populate('author', 'name avatar');

      // Merge avoiding duplicates
      const existingIds = new Set(recommendations.map((r) => r._id.toString()));
      fallback.forEach((r) => {
        if (!existingIds.has(r._id.toString()) && recommendations.length < 8) {
          recommendations.push(r);
        }
      });
    }

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get similar recipes for detail page
 * @route GET /api/recipes/:id/similar
 * @access Public
 */
const getSimilarRecipes = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Match by cuisine or mealType, excluding current recipe
    let similar = await Recipe.find({
      _id: { $ne: recipe._id },
      isPublished: true,
      $or: [
        { cuisine: recipe.cuisine },
        { mealType: recipe.mealType },
        { dietaryTags: { $in: recipe.dietaryTags || [] } },
      ],
    })
      .sort({ averageRating: -1, favoritesCount: -1 })
      .limit(4)
      .populate('author', 'name avatar');

    // Fallback if fewer than 4 matches
    if (similar.length < 4) {
      const existingIds = new Set([recipe._id.toString(), ...similar.map((s) => s._id.toString())]);
      const fallback = await Recipe.find({
        _id: { $nin: Array.from(existingIds) },
        isPublished: true,
      })
        .sort({ averageRating: -1, favoritesCount: -1 })
        .limit(4 - similar.length)
        .populate('author', 'name avatar');

      similar = [...similar, ...fallback];
    }

    res.status(200).json({
      success: true,
      count: similar.length,
      similar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Search recipes by name or multiple ingredients with match ranking & autocomplete suggestions
 * @route GET /api/recipes/search
 * @access Public
 */
const searchRecipes = async (req, res, next) => {
  try {
    const { q, ingredients, cuisine, mealType, difficulty, foodType, suggest, page = 1, limit = 12 } = req.query;

    // Autocomplete suggestions mode
    if (suggest === 'true' || suggest === '1') {
      const searchTerm = (q || '').trim();
      if (!searchTerm) {
        return res.status(200).json({ success: true, suggestions: [] });
      }

      const regex = new RegExp(searchTerm, 'i');
      const matches = await Recipe.find(
        { isPublished: true, title: regex },
        'title cuisine image averageRating cookTime difficulty'
      ).limit(6);

      const suggestions = matches.map((m) => ({
        id: m._id,
        title: m.title,
        cuisine: m.cuisine,
        image: m.image,
        rating: m.averageRating,
        cookTime: m.cookTime,
        difficulty: m.difficulty,
      }));

      return res.status(200).json({
        success: true,
        suggestions,
      });
    }

    // Multi-ingredient and keyword search
    const query = { isPublished: true };
    let ingList = [];

    if (ingredients && typeof ingredients === 'string') {
      ingList = ingredients
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { cuisine: regex },
        { dietaryTags: regex },
        { 'ingredients.name': regex },
      ];
    }

    // Cuisine filter
    if (cuisine && cuisine !== 'All') {
      query.cuisine = new RegExp(`^${cuisine.trim()}$`, 'i');
    }

    // Meal type filter
    if (mealType && mealType !== 'All') {
      query.mealType = mealType;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Food type filter (Veg / Non-Veg)
    if (foodType && foodType !== 'All') {
      if (foodType === 'Veg') {
        query.isVeg = true;
      } else if (foodType === 'Non-Veg') {
        query.isVeg = false;
      }
    }

    // If ingredients provided, query for recipes containing at least one
    if (ingList.length > 0) {
      const ingRegexes = ingList.map((ing) => new RegExp(ing, 'i'));
      query['ingredients.name'] = { $in: ingRegexes };
    }

    let results = await Recipe.find(query)
      .populate('author', 'name avatar')
      .lean();

    // If searched by ingredients, calculate match rank for each recipe
    if (ingList.length > 0) {
      results = results.map((recipe) => {
        const recipeIngNames = (recipe.ingredients || []).map((i) => (i.name || '').toLowerCase());
        const matched = [];
        ingList.forEach((searchIng) => {
          if (recipeIngNames.some((rName) => rName.includes(searchIng))) {
            matched.push(searchIng);
          }
        });

        return {
          ...recipe,
          matchCount: matched.length,
          matchedIngredients: matched,
          matchPercentage: recipe.ingredients?.length
            ? Math.round((matched.length / recipe.ingredients.length) * 100)
            : 0,
        };
      });

      // Sort descending by number of matched ingredients, then by average rating
      results.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return (b.averageRating || 0) - (a.averageRating || 0);
      });
    } else {
      // Prioritize recipes with active video access so they appear above
      results.sort((a, b) => {
        const hasA = Boolean(a.videoUrl && a.videoUrl.trim());
        const hasB = Boolean(b.videoUrl && b.videoUrl.trim());
        if (hasA && !hasB) return -1;
        if (!hasA && hasB) return 1;
        return 0;
      });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const total = results.length;
    const paginated = results.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      currentPage: pageNum,
      recipes: paginated,
      searchedIngredients: ingList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  toggleBookmark,
  getUserCollections,
  addReview,
  deleteReview,
  addComment,
  deleteComment,
  addCommentReply,
  deleteCommentReply,
  getRecommendations,
  getSimilarRecipes,
  searchRecipes,
};

