import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChefHat,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Clock,
  Flame,
  ArrowLeft,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const PHOTO_PRESETS = [
  { label: 'Italian Pasta', url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Butter Chicken Curry', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Crispy Baja Tacos', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tokyo Shoyu Ramen', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Avocado Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mediterranean Salad', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80' },
  { label: 'French Crème Brûlée', url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Thai Green Curry', url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Artisan Woodfired Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80' },
];

export default function CreateEditRecipe() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: 'Italian',
    mealType: 'Dinner',
    difficulty: 'Medium',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    caloriesPerServing: 450,
    dietaryTags: [],
    image: PHOTO_PRESETS[0].url,
    videoUrl: '',
    isPublished: true,
    ingredients: [
      { name: '', quantity: 1, unit: 'g', notes: '' },
      { name: '', quantity: 2, unit: 'tbsp', notes: '' },
    ],
    instructions: [
      { stepNumber: 1, title: 'Preparation', instruction: '', timerMinutes: 5 },
      { stepNumber: 2, title: 'Cooking', instruction: '', timerMinutes: 15 },
    ],
  });

  // If editing, load recipe data
  useEffect(() => {
    if (isEditing) {
      const loadRecipe = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/recipes/${id}`);
          if (res.success && res.recipe) {
            const r = res.recipe;
            setFormData({
              title: r.title,
              description: r.description,
              cuisine: r.cuisine,
              mealType: r.mealType,
              difficulty: r.difficulty,
              prepTime: r.prepTime,
              cookTime: r.cookTime,
              servings: r.servings,
              caloriesPerServing: r.caloriesPerServing || 0,
              dietaryTags: r.dietaryTags || [],
              image: r.image || PHOTO_PRESETS[0].url,
              videoUrl: r.videoUrl || '',
              isPublished: r.isPublished !== undefined ? r.isPublished : true,
              ingredients: r.ingredients?.length ? r.ingredients : [{ name: '', quantity: 1, unit: '', notes: '' }],
              instructions: r.instructions?.length ? r.instructions : [{ stepNumber: 1, title: '', instruction: '', timerMinutes: 0 }],
            });
          }
        } catch (err) {
          showToast(err.message, 'error');
          navigate('/recipes');
        } finally {
          setLoading(false);
        }
      };

      loadRecipe();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleDietaryTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.dietaryTags.includes(tag);
      return {
        ...prev,
        dietaryTags: exists
          ? prev.dietaryTags.filter((t) => t !== tag)
          : [...prev.dietaryTags, tag],
      };
    });
  };

  // Ingredients builder helpers
  const handleIngredientChange = (index, field, value) => {
    setFormData((prev) => {
      const newIngs = [...prev.ingredients];
      newIngs[index] = { ...newIngs[index], [field]: value };
      return { ...prev, ingredients: newIngs };
    });
  };

  const addIngredientRow = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 1, unit: '', notes: '' }],
    }));
  };

  const removeIngredientRow = (index) => {
    if (formData.ingredients.length <= 1) {
      showToast('A recipe must have at least one ingredient', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Instructions builder helpers
  const handleInstructionChange = (index, field, value) => {
    setFormData((prev) => {
      const newInsts = [...prev.instructions];
      newInsts[index] = { ...newInsts[index], [field]: value };
      return { ...prev, instructions: newInsts };
    });
  };

  const addInstructionRow = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        {
          stepNumber: prev.instructions.length + 1,
          title: `Step ${prev.instructions.length + 1}`,
          instruction: '',
          timerMinutes: 0,
        },
      ],
    }));
  };

  const removeInstructionRow = (index) => {
    if (formData.instructions.length <= 1) {
      showToast('A recipe must have at least one instruction step', 'info');
      return;
    }
    setFormData((prev) => {
      const filtered = prev.instructions.filter((_, i) => i !== index);
      return {
        ...prev,
        instructions: filtered.map((inst, i) => ({ ...inst, stepNumber: i + 1 })),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please provide a recipe title', 'error');
      return;
    }

    if (!formData.description.trim()) {
      showToast('Please provide a short description', 'error');
      return;
    }

    const validIngredients = formData.ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      showToast('Please add at least one named ingredient', 'error');
      return;
    }

    const validInstructions = formData.instructions.filter((inst) => inst.instruction.trim());
    if (validInstructions.length === 0) {
      showToast('Please provide at least one cooking instruction step', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        ingredients: validIngredients,
        instructions: validInstructions,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/recipes/${id}`, payload);
      } else {
        res = await api.post('/recipes', payload);
      }

      if (res.success) {
        showToast(
          isEditing ? 'Recipe updated successfully!' : 'Recipe published successfully!',
          'success'
        );
        const targetId = res.recipe?._id || id;
        navigate(`/recipes/${targetId}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const availableTags = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Keto',
    'Pescatarian',
    'Dairy-Free',
    'Halal',
    'Kosher',
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 w-1/3 bg-stone-200 rounded-xl" />
        <div className="h-64 bg-stone-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>

        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          {isEditing ? 'Editing Recipe' : 'New Creation'}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="border-b border-stone-100 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <ChefHat className="w-7 h-7 text-amber-600" />
            {isEditing ? 'Update Your Recipe' : 'Create & Publish Recipe'}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Fill in the ingredients, measurements, and cooking instructions for other food lovers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900">Basic Information</h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Recipe Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Authentic Roman Spaghetti Carbonara"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Short Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the flavors, aromas, and story behind this dish..."
                className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Selects: Cuisine, Meal Type, Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Cuisine *
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer"
                >
                  {['Italian', 'Indian', 'Mexican', 'Japanese', 'Mediterranean', 'American', 'French', 'Thai', 'Chinese', 'Other'].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Meal Type *
                </label>
                <select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer"
                >
                  {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverages'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Difficulty Level *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer"
                >
                  {['Easy', 'Medium', 'Hard'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timings, Servings, Calories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Prep Time (min) *
                </label>
                <input
                  type="number"
                  name="prepTime"
                  min="0"
                  required
                  value={formData.prepTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Cook Time (min) *
                </label>
                <input
                  type="number"
                  name="cookTime"
                  min="0"
                  required
                  value={formData.cookTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  min="1"
                  required
                  value={formData.servings}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Calories / Serving
                </label>
                <input
                  type="number"
                  name="caloriesPerServing"
                  min="0"
                  value={formData.caloriesPerServing}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Media Section: Image & Video */}
          <div className="space-y-4 pt-6 border-t border-stone-100">
            <h3 className="text-base font-bold text-stone-900">Food Photography & Video</h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Food Image URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="image"
                  required
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono text-stone-800 focus:outline-none"
                />
              </div>

              {/* Presets Gallery Picker */}
              <div className="mt-3">
                <span className="text-xs text-stone-500 font-semibold">Or pick from curated food photo presets:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, image: preset.url }))}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        formData.image === preset.url
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Preview Box */}
              {formData.image && (
                <div className="mt-3 aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                  <img
                    src={formData.image}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-stone-900/70 text-white text-[10px] font-bold">
                    Live Photo Preview
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Recipe Video URL (Optional - YouTube or MP4)
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="e.g., https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="space-y-3 pt-6 border-t border-stone-100">
            <h3 className="text-base font-bold text-stone-900">Dietary Badges</h3>
            <p className="text-xs text-stone-500">Select any that apply to help users find this recipe:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = formData.dietaryTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietaryTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {selected ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients Builder */}
          <div className="space-y-4 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Ingredients List *</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Specify ingredient names, amounts, and units (e.g., 400 g Spaghetti)
                </p>
              </div>
              <button
                type="button"
                onClick={addIngredientRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-2xl bg-stone-50 border border-stone-200">
                  <input
                    type="text"
                    required
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    placeholder="Ingredient name (e.g. Olive Oil)"
                    className="flex-3 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-20 px-2 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none text-center"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    placeholder="Unit (g, tbsp, cups)"
                    className="w-28 px-2 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none text-center"
                  />
                  <input
                    type="text"
                    value={ing.notes}
                    onChange={(e) => handleIngredientChange(idx, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="hidden sm:block flex-2 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(idx)}
                    className="p-2 text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Builder */}
          <div className="space-y-4 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Step-by-Step Instructions *</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Add clear steps and optional timer durations (in minutes) for countdowns
                </p>
              </div>
              <button
                type="button"
                onClick={addInstructionRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.instructions.map((inst, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-extrabold text-xs text-amber-800 uppercase tracking-wider">
                      Step {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-stone-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] text-stone-600 font-semibold">Timer:</span>
                        <input
                          type="number"
                          min="0"
                          value={inst.timerMinutes || 0}
                          onChange={(e) => handleInstructionChange(idx, 'timerMinutes', e.target.value)}
                          className="w-12 text-center text-xs font-bold text-amber-800 focus:outline-none"
                        />
                        <span className="text-[11px] text-stone-500">min</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInstructionRow(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={inst.title}
                    onChange={(e) => handleInstructionChange(idx, 'title', e.target.value)}
                    placeholder="Step Title (e.g. Crisp the Bacon)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none"
                  />

                  <textarea
                    rows={2}
                    required
                    value={inst.instruction}
                    onChange={(e) => handleInstructionChange(idx, 'instruction', e.target.value)}
                    placeholder="Explain exactly what the cook needs to do in this step..."
                    className="w-full p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-8 border-t border-stone-200 flex items-center justify-end gap-3">
            <Link
              to="/recipes"
              className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Recipe' : 'Publish Recipe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
