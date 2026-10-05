# 🍳 RecipeHaven — Full-Stack Food Recipe Application

A modern, production-grade web application where food lovers and chefs discover, search, save, and share recipes based on ingredients, cuisine, meal types, and dietary preferences. Features step-by-step cooking instructions with live step timers, an interactive servings scaler, personal shopping lists, ratings/reviews, threaded discussions, social sharing, smart personalized recommendations, and a comprehensive admin management dashboard.

> 📚 **Complete Project Documentation & Viva Defense Guide**:  
> • Markdown Documentation: [RecipeHaven_Project_Documentation_and_Viva_Guide.md](./RecipeHaven_Project_Documentation_and_Viva_Guide.md)  
> • PDF Document: [RecipeHaven_Project_Documentation_and_Viva_Guide.pdf](./RecipeHaven_Project_Documentation_and_Viva_Guide.pdf)  
> • Formatted HTML: [RecipeHaven_Project_Documentation_and_Viva_Guide.html](./RecipeHaven_Project_Documentation_and_Viva_Guide.html)  

---

## 🌟 Key Features

1. **Authentication & User Profiles**
   - User registration & login with bcrypt password hashing and persistent JWT authentication.
   - Profile management: customized avatar, chef bio, and culinary preferences (favorite cuisines, dietary restrictions, preferred meal types).
   - Role-based authorization: **Guest**, **Registered User**, and **Administrator**.

2. **Smart Recipe Search & Multi-Filters**
   - Instant search across recipe titles, descriptions, cuisines, and ingredients.
   - Ingredient-based discovery: find dishes using ingredients already in your pantry.
   - Filters: Cuisine (Italian, Indian, Mexican, Chinese, Japanese, American, etc.), Meal Type (Breakfast, Lunch, Dinner, Snack, Dessert, Beverages), Difficulty (Easy, Medium, Hard), and Cooking Time (under 15, 30, 60 minutes).
   - Multi-criteria sorting: Newest, Highest Rated, Most Popular, and Fastest Cooking Time.

3. **Rich Recipe Detail Experience**
   - **Interactive Servings Scaler**: Automatically recalculates ingredient amounts dynamically.
   - **Step-by-Step Cooking Mode**: Detailed numbered instructions with built-in timers and progress checkboxes.
   - **Nutrition Insights**: Calories per serving, prep time, cook time, and total time calculations.
   - **Media Gallery**: High-resolution cover images and embedded video player (YouTube/MP4).

4. **Community Engagement & Social Features**
   - **Favorites & Bookmarks**: 1-click heart icon to save favorite dishes and bookmark recipes for later.
   - **Ratings & Reviews**: 1–5 star ratings with rich feedback, updating overall average ratings in real time.
   - **Comment Discussions**: Nested discussion threads with full moderation capabilities.
   - **Social Sharing**: Direct link copy, WhatsApp, Facebook, X (Twitter), and Email share dialogues.

5. **Smart Shopping List**
   - 1-click "Add to Shopping List" from any recipe.
   - Interactive checkbox state, individual removal, clear completed, and instant item addition.

6. **Personalized Recommendations**
   - Recommendation engine powered by user cuisine preferences and past interaction patterns.
   - Fallback to trending and highest-rated dishes for guests and new users.

7. **Administrator Dashboard**
   - Overview metrics & statistics: Total users, published recipes, featured recipes, reviews, and average platform rating.
   - Cuisine distribution analytics and recent activity feeds.
   - Recipe management: toggle featured status, publish/unpublish, and deletion.
   - User management: search users, promote/demote roles (`user` ⇄ `admin`), block/unblock accounts, and deletion.

8. **Resilient Data Layer & Uploads**
   - Automatic MongoDB Atlas connection with seamless, zero-config in-memory MongoDB fallback.
   - Automatic database seeding with 34 high-quality culinary recipes and pre-configured demo accounts.
   - Multer file upload pipeline with Cloudinary integration and local static storage fallback (`/uploads`).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, Tailwind CSS v4, Lucide React Icons
- **Backend**: Node.js, Express.js (REST API)
- **Database**: MongoDB with Mongoose (Atlas + In-Memory Fallback)
- **Auth & Security**: JWT (JSON Web Tokens), bcryptjs password hashing, Helmet, CORS, Express Rate Limit
- **Media Uploads**: Multer + Cloudinary (with local static fallback)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Clone & Setup Dependencies
```bash
git clone https://github.com/Arshad-010/Food-Recipe-Application.git
cd Food-Recipe-Application

# Install all backend and frontend dependencies
npm run install:all
```

### 2. Configure Environment Variables
Copy the example files and adjust if needed:
```bash
# Backend configuration
cp FRA_Backend/.env.example FRA_Backend/.env

# Frontend configuration
cp FRA_Frontend/.env.example FRA_Frontend/.env
```

### 3. Start Development Servers
Run both backend and frontend concurrently or in separate terminals:

```bash
# Terminal 1: Start Backend API (runs on http://localhost:5050)
npm run server

# Terminal 2: Start Frontend Client (runs on http://localhost:5173 or 5176)
npm run client
```

---

## 🔐 Default Demo Accounts

The database automatically initializes the following test accounts:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@recipehaven.com` | `Password@123` |
| **Home Chef** | `chef@recipehaven.com` | `Password@123` |

*(Tip: On the Login screen, click **"Fill Admin Demo"** for instant 1-click credential population).*

---

## 📡 REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new chef account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update display name, avatar, and bio
- `PUT /api/auth/preferences` — Update favorite cuisines, diet type, and meal types
- `PUT /api/auth/password` — Change password securely

### Recipes (`/api/recipes`)
- `GET /api/recipes` — List recipes with search, multi-filters, sorting, and pagination
- `GET /api/recipes/:id` — Get single recipe by ID with populated author, reviews, and comments
- `POST /api/recipes` — Create a new recipe (authenticated)
- `PUT /api/recipes/:id` — Edit owned recipe (or admin)
- `DELETE /api/recipes/:id` — Delete owned recipe (or admin)
- `GET /api/recipes/recommendations` — Personalized or trending recipe recommendations
- `GET /api/recipes/my/collections` — User's authored, favorite, and bookmarked recipes
- `POST /api/recipes/:id/favorite` — Toggle recipe favorite state
- `POST /api/recipes/:id/bookmark` — Toggle recipe bookmark state
- `POST /api/recipes/:id/reviews` — Submit 1–5 star rating and review
- `POST /api/recipes/:id/comments` — Post a discussion comment
- `DELETE /api/recipes/:id/comments/:commentId` — Delete a comment

### Shopping List (`/api/shopping-list`)
- `GET /api/shopping-list` — Get authenticated user's shopping list
- `POST /api/shopping-list/add` — Add items to list
- `PATCH /api/shopping-list/items/:itemId/toggle` — Toggle item checked status
- `DELETE /api/shopping-list/items/:itemId` — Remove individual item
- `DELETE /api/shopping-list/completed` — Clear all checked items
- `DELETE /api/shopping-list/clear` — Clear entire shopping list

### Media Uploads (`/api/upload`)
- `POST /api/upload/image` — Upload image file (Cloudinary or local static fallback)
- `POST /api/upload/video` — Upload video file (Cloudinary or local static fallback)

### Admin Management (`/api/admin`)
- `GET /api/admin/stats` — Platform metrics, review analytics, cuisine distribution
- `GET /api/admin/users` — Search, filter, and paginate all platform users
- `PATCH /api/admin/users/:userId/role` — Update user role (`user` / `admin`)
- `PATCH /api/admin/users/:userId/block` — Suspend or reactivate user account
- `DELETE /api/admin/users/:userId` — Delete user account
- `PATCH /api/admin/recipes/:recipeId/feature` — Toggle featured recipe status
- `DELETE /api/admin/recipes/:recipeId` — Remove recipe with admin privilege

---

## 🧪 Testing Verification
- Frontend builds: `npm run build` in `FRA_Frontend` verified with 0 errors.
- Backend API: Verified health check, authentication, recipe search, reviews, shopping list, admin endpoints, and image/video uploads.
