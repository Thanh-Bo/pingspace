# 📱 PINGSPACE - Full Stack Chat Application

## 🎯 Tổng Quan Dự Án

**Pingspace** là một ứng dụng chat thời gian thực được xây dựng bằng Node.js, Express, React, TypeScript với Socket.io cho tính năng real-time.

---

## 📦 Tech Stack

### **Backend**
- **Framework:** Express.js
- **Runtime:** Node.js
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT + Google OAuth 2.0
- **Real-time:** Socket.io
- **Image Upload:** Cloudinary
- **Security:** Helmet, CORS, Cookie Parser
- **Email:** Nodemailer, Mailtrap
- **Other:** Bcrypt, bcryptjs, Redis (ioredis)

### **Frontend**
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **UI Components:** Shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Toast Notifications:** React Hot Toast
- **Icon Library:** Lucide React, React Icons
- **Form Management:** React Hook Form
- **Validation:** Zod

---

## 🗂️ Cấu Trúc Thư Mục

### **Backend Structure** (`backend/`)
```
backend/
├── controllers/          # Logic xử lý các request
│   ├── auth.controller.js         (Đăng ký, đăng nhập, Google OAuth)
│   ├── user.controller.js         (Quản lý thông tin người dùng)
│   ├── message.controller.js      (Xử lý tin nhắn)
│   ├── group.controller.js        (Quản lý nhóm chat)
│   ├── post.controller.js         (Tạo, xóa, like bài viết)
│   ├── notification.controller.js (Quản lý thông báo)
│   └── request.controller.js      (Xử lý lời mời kết bạn)
│
├── routes/              # API endpoints
│   ├── auth.route.js
│   ├── user.route.js
│   ├── message.route.js
│   ├── group.route.js
│   ├── post.route.js
│   ├── notification.route.js
│   └── request.route.js
│
├── models/              # MongoDB schemas
│   ├── auth.model.js
│   ├── user.model.js
│   ├── message.model.js
│   ├── group.model.js
│   ├── post.model.js
│   ├── notification.model.js
│   └── request.model.js
│
├── middleware/
│   └── auth.middleware.js  (Xác thực JWT)
│
├── lib/
│   ├── db.js             (Kết nối MongoDB)
│   ├── socket.js         (Socket.io setup)
│   ├── jwt.js            (Tạo & verify JWT)
│   └── cloudinary.js     (Config upload ảnh)
│
├── server.js             # Main server entry point
└── .env                  # Environment variables
```

### **Frontend Structure** (`frontend/src/`)
```
src/
├── components/
│   ├── home/
│   │   ├── ChatComponents/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatItems.tsx
│   │   │   ├── CreateGroupDialog.tsx
│   │   │   ├── MediaDropdown.tsx
│   │   │   └── ...
│   │   ├── PostComponents/
│   │   │   ├── CreatePost.tsx
│   │   │   ├── PostCard.tsx
│   │   │   └── ...
│   │   ├── FriendsListComponents/
│   │   ├── ProfileComponents/
│   │   └── NotificationComponents/
│   ├── leftPanel/   (Sidebar trái)
│   ├── rightPanel/  (Sidebar phải)
│   ├── pages/
│   │   ├── ChatBoxPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── FriendPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── PostPage.tsx
│   │   ├── NotificationPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── ui/          (Shadcn/ui components)
│   ├── mode-toggle.tsx
│   ├── theme-provider.tsx
│   └── SideBarPage.tsx
│
├── store/           # Zustand stores (State Management)
│   ├── useAuthStore.ts
│   ├── useChatStore.ts
│   ├── useGroupStore.ts
│   ├── usePostStore.ts
│   ├── useNotificationStore.ts
│   ├── useRequestStore.ts
│   └── check.tsx
│
├── lib/
│   ├── axios.ts     (Axios instance với config)
│   ├── date.ts
│   ├── svgs.tsx
│   └── utils.ts
│
├── assets/          (Images, etc)
├── dummy/           (Mock data)
├── App.tsx          (Main app component)
├── main.tsx         (React entry point)
└── index.css        (Global styles)
```

---

## 🔑 Chức Năng Chính

### **1. Authentication**
- ✅ Đăng ký bằng email/password
- ✅ Đăng nhập bằng email/password
- ✅ Đăng nhập Google (Google OAuth 2.0)
- ✅ JWT token (7 ngày)
- ✅ Bcrypt password hashing

### **2. Chat & Messaging**
- ✅ Chat 1-1 (Direct Messages)
- ✅ Group Chat (Tạo nhóm, thêm/xoá thành viên)
- ✅ Gửi tin nhắn text
- ✅ Gửi hình ảnh (base64)
- ✅ Real-time updates (Socket.io)
- ✅ Online status

### **3. Social Features**
- ✅ Tìm kiếm người dùng
- ✅ Gửi lời mời kết bạn
- ✅ Danh sách bạn
- ✅ Tạo bài viết (text + image + video)
- ✅ Like bài viết
- ✅ Nhận thông báo

### **4. Profile**
- ✅ Xem/chỉnh sửa hồ sơ
- ✅ Thay đổi avatar
- ✅ Thay đổi cover image
- ✅ Quản lý thông tin cá nhân

---

## 🚀 Cách Chạy Project

### **Bước 1: Install Dependencies**
```bash
# Cài toàn bộ
npm install

# Hoặc cài riêng
cd backend && npm install
cd ../frontend && npm install
```

### **Bước 2: Tạo file `.env`**
```bash
# backend/.env
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_CLOUD_NAME=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/db
PORT=5000
```

### **Bước 3: Chạy Project**

**Cách 1: Chạy cả Backend và Frontend**
```bash
# Từ thư mục root
npm run dev
```

**Cách 2: Chạy riêng lẻ**
```bash
# Terminal 1 - Backend (Port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (Port 5173)
cd frontend && npm run dev
```

### **Bước 4: Truy cập**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📡 API Routes

### **Auth**
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google` - Google OAuth

### **Users**
- `GET /api/user/search` - Tìm kiếm người dùng
- `GET /api/user/:id` - Lấy info người dùng
- `PUT /api/user/:id` - Update profile

### **Messages**
- `POST /api/message/send` - Gửi tin nhắn
- `GET /api/message/:chatId` - Lấy messages
- `DELETE /api/message/:id` - Xoá message

### **Groups**
- `POST /api/group/create` - Tạo nhóm
- `PUT /api/group/:id/image` - Update group image
- `POST /api/group/:id/members` - Thêm thành viên
- `DELETE /api/group/:id/members/:userId` - Xoá thành viên

### **Posts**
- `POST /api/post` - Tạo bài viết
- `GET /api/post` - Lấy danh sách bài
- `POST /api/post/:id/like` - Like bài
- `DELETE /api/post/:id` - Xoá bài

### **Requests**
- `POST /api/request/send` - Gửi lời mời kết bạn
- `GET /api/request/pending` - Lấy pending requests
- `POST /api/request/accept/:id` - Accept request
- `POST /api/request/reject/:id` - Reject request

### **Notifications**
- `GET /api/notification` - Lấy notifications
- `POST /api/notification/mark-read` - Mark as read

---

## 🔐 Security Features

- ✅ CORS (Cross-Origin Resource Sharing)
- ✅ Helmet - HTTP headers security
- ✅ JWT - Token-based authentication
- ✅ Bcrypt - Password hashing
- ✅ Cookie - HTTP-only cookies
- ✅ Environment variables (.env)

---

## 🎨 UI Components

Sử dụng **Shadcn/ui** components:
- Button, Input, Textarea
- Avatar, Dialog, Dropdown-menu
- Card, Separator, Select
- Form, Label, Popover
- Radio-group, Scroll-area
- Calendar, Date Picker

---

## 🔄 Real-time Features (Socket.io)

**Events:**
- `connection` - Khi user kết nối
- `getOnlineUsers` - Danh sách users online
- `newMessage` - Tin nhắn mới
- `userTyping` - User đang gõ
- `disconnect` - User ngắt kết nối

---

## 📝 Environment Variables Cần Thiết

```
# Database
MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/db

# Cloudinary (Upload ảnh)
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_CLOUD_NAME=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# JWT
JWT_SECRET=...

# Server
PORT=5000
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- ✅ Tạo file `.env` trong `backend/`
- ✅ Thêm IP whitelist vào MongoDB Atlas
- ✅ Kiểm tra connection string

### CORS Error
- ✅ Frontend URL phải trong `origin` array ở `server.js`
- ✅ Credentials phải set `true`

### Socket.io Not Working
- ✅ Backend phải export `io` từ `socket.js`
- ✅ Frontend phải connect đến đúng URL

---

## 💡 Future AI Features (từ README)

Dự án có kế hoạch thêm:
1. 🧠 Smart Chatbot
2. 📝 Message Summary
3. 🔍 Smart Search
4. 🌐 Real-time Translation
5. 🔒 Smart Message Filtering
6. 📎 AI File/Link Summarizer
7. ✍️ AI Writing Assistant

---

## 📞 Thông Tin Liên Hệ

Nếu gặp lỗi hoặc có câu hỏi, hãy kiểm tra:
1. File `.env` có đúng không
2. MongoDB connection string
3. Google OAuth credentials
4. Network access whitelist

