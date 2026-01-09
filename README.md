# UIU Canteen

A full-stack web application for managing university canteen operations, allowing shop owners to manage their shops and menu items, and users to browse available food items.

## 🚀 Features

### User Roles
- **User** - Browse shops and menu items
- **Owner** - Create and manage shops, add/edit menu items
- **Delivery Boy** - Handle deliveries

### Core Functionality
- 🔐 **Authentication** - Sign up, sign in, password reset with OTP verification
- 🏪 **Shop Management** - Create, edit, and manage shops with images
- 🍔 **Menu Items** - Add, edit, and categorize food items
- 📍 **Location-based** - City and state-based shop organization
- 🖼️ **Image Upload** - Cloudinary integration for image storage
- 🔥 **Firebase Integration** - Additional authentication support

### Food Categories
- Snacks
- Desserts
- Burgers
- Sandwiches
- Drinks
- Fast Food
- Chinese
- Others

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + Cloudinary
- **Email Service**: Nodemailer

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Authentication**: Firebase

## 📁 Project Structure

```
Web_Project_01/
├── Backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middlewares/    # Auth & file upload middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Cloudinary, mail, token utilities
│   └── index.js        # Entry point
│
├── Frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── assets/     # Images and static files
│       ├── components/ # Reusable components
│       ├── hooks/      # Custom React hooks
│       ├── pages/      # Page components
│       ├── redux/      # Redux store and slices
│       ├── App.jsx     # Main app component
│       └── main.jsx    # Entry point
│
└── package.json
```

## 🔧 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Cloudinary account
- Firebase project (for additional auth)

### Environment Variables

Create a `.env` file in the `Backend` folder with the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend server will run on `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register a new user
- `POST /signin` - Login user
- `POST /forgot-password` - Request password reset
- `POST /verify-otp` - Verify OTP for password reset
- `POST /reset-password` - Reset password

### User (`/api/user`)
- `GET /me` - Get current user profile
- `PUT /update` - Update user profile

### Shop (`/api/shop`)
- `POST /create` - Create a new shop
- `GET /my-shop` - Get owner's shop
- `PUT /update/:id` - Update shop details
- `DELETE /:id` - Delete a shop

### Items (`/api/item`)
- `POST /add` - Add a new item
- `GET /shop/:shopId` - Get items by shop
- `PUT /update/:id` - Update an item
- `DELETE /:id` - Delete an item

## 🏃 Running the Application

1. Start MongoDB service
2. Start the backend server: `cd Backend && npm run dev`
3. Start the frontend: `cd Frontend && npm run dev`
4. Open `http://localhost:5173` in your browser

## 📝 Scripts

### Backend
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 👤 Author

**Rafi**

## 📄 License

ISC License
