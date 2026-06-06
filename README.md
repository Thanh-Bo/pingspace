# PINGSPACE — Full-Stack Real-Time Social & Chat Platform

Welcome to **Pingspace**, a state-of-the-art, high-performance real-time messaging and social feed platform. Built using **React 19, TypeScript, Express, Socket.io, and Mongoose**, Pingspace delivers a premium, highly responsive user experience with modern UI/UX patterns like smooth glassmorphism, animated glow inputs, real-time presence indicators, and rich post media support.

---

## Key Features

### Real-Time Messaging
* **Direct Messages (1-to-1):** Instantly chat with your friends. Includes typing indicators, read/receipt ticks, and media support.
* **Group Chats:** Create channels, update group avatars, and add/remove members dynamically.
* **Presence Indicators:** Live green activity dots on avatars and clean header text indicators ("Online" vs "Offline") powered by Socket.io.

### Social Feed & Media Sharing
* **Rich Posts:** Share text, images, and videos up to 20MB.
* **Likes & Interactions:** Live counter updates for post likes and comments.
* **Cloudinary CDN Integration:** All images and videos are securely uploaded and served through Cloudinary.
* **Absolute Emoji Picker:** Interactive emoji picker overlay for creating rich, expressive posts.

### Authentication & Security
* **JWT Session Management:** Secure, HTTP-only cookie tokens expiring in 7 days.
* **Google OAuth 2.0 Integration:** Quick sign-up and sign-in with automatic Google profile image syncing.
* **Bcrypt Password Hashing:** Zero plain-text password storage.
* **Password Visibility Toggler:** Secure absolute password show/hide button on Login/Signup screens.

### Premium UI/UX & Themes
* **Theme Toggle:** Switch dynamically between gorgeous Light and Dark modes.
* **Animated Inputs:** custom focus ring glow effects on text fields and textareas.
* **Responsive Layout:** Designed to scale beautifully across Desktop, Tablet, and Mobile screens.

---

## Tech Stack

### Frontend
* **Core:** React 19, TypeScript, Vite
* **Routing:** React Router v7
* **State Management:** Zustand
* **Styling:** Tailwind CSS 4, Vanilla CSS variable tokens
* **Components:** Shadcn/ui & Radix UI primitives

### Backend
* **Runtime:** Node.js, Express.js
* **Database:** MongoDB (compatible with MongoDB Atlas & Azure Cosmos DB)
* **Real-time:** Socket.io
* **Media Uploads:** Cloudinary SDK
* **Security:** Helmet, CORS, Cookie-Parser, BcryptJS

---

## Project Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed.

### 1. Clone & Install Dependencies
Run the command below from the root of the workspace to install all dependencies:
```bash
npm install
```
*(Alternatively, you can run `npm install` inside both `/frontend` and `/backend` separately).*

### 2. Environment Variables Setup

Create a `.env` file inside the `backend/` folder:
```env
# Server Port
PORT=5000

# Database Connection (MongoDB or Azure Cosmos DB)
MONGODB=mongodb://your_mongodb_connection_string

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Domains
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file inside the `frontend/` folder:
```env
# Development or Production API Endpoints
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Running the Application

### Development Mode
To run both the backend server and frontend client concurrently:
```bash
npm run dev
```
* **Frontend local address:** `http://localhost:5173`
* **Backend local server:** `http://localhost:5000`

### Production Build
To generate the production bundle for deployment:
```bash
cd frontend && npm run build
```

---

## Database Indexing (Cosmos DB Compatibility)
If you deploy this application using **Azure Cosmos DB (MongoDB API)**, you must index sorting fields.
Pingspace is configured with **automatic Mongoose schemas indexing** on `createdAt` to support query sorting compatibility:
* **Post Schema:** Index on `{ createdAt: -1 }` (reverse chronological feeds)
* **Message Schema:** Index on `{ createdAt: 1 }` (sequential chat messages)
* **Notification Schema:** Index on `{ createdAt: -1 }` (recent notifications first)

Mongoose automatically pushes these index definitions to your MongoDB / Cosmos DB database on startup.

---

## Future Enhancements (AI Roadmap)
* [ ] **Smart Chatbot:** Custom AI agent inside your friend list.
* [ ] **Message Summary:** Summarize long group conversations with one click.
* [ ] **Real-time Translator:** Auto-translate chats into your preferred language.
* [ ] **Smart Filter:** Flag harmful/spam messages dynamically.
