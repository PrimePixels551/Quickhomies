# 🏠 QuickHomies

A full-stack home service booking platform connecting customers with verified service professionals.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 📱 Features

### For Customers
- Browse and book various home services
- View professional profiles and ratings
- Track booking status in real-time
- Rate and review completed services
- Cash payment collection

### For Service Providers
- Partner dashboard with earnings tracking
- Accept/manage incoming service requests
- Collect payments from customers
- Build reputation through reviews

### For Admins
- Manage users and professionals
- Approve/reject professional registrations
- View all bookings and reviews
- Service category management

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js, Express.js, MongoDB |
| **Mobile App** | React Native, Expo |
| **Admin Panel** | React, Vite, TailwindCSS |
| **Authentication** | JWT |

## 📁 Project Structure

```
QuickHomies/
├── Backend/           # Node.js API server
│   ├── config/        # Database configuration
│   ├── controllers/   # Route controllers
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   └── server.js      # Entry point
│
├── Home/              # React Native mobile app
│   ├── app/           # Expo Router pages
│   ├── components/    # Reusable components
│   ├── config/        # App configuration
│   ├── constants/     # Colors, themes
│   └── services/      # API services
│
└── admin/             # React admin panel
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Expo CLI
- npm or yarn

### Backend Setup

```bash
cd Backend
npm install
cp .env.example .env  # Configure environment
npm run dev
```

### Mobile App Setup

```bash
cd Home
npm install
npx expo start
```

### Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/quickhomies
JWT_SECRET=your-secret-key
```

### Mobile App (config/index.ts)
- Update `apiUrl` with your backend URL
- Update production API URL

### Admin Panel (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Building for Production

### Mobile App (Android APK)
```bash
cd Home
eas build -p android --profile preview
```

### Admin Panel
```bash
cd admin
npm run build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Security Features

- ✅ Helmet.js security headers
- ✅ Rate limiting
- ✅ MongoDB injection prevention
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Input validation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/admin` - Update user (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get all reviews

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

Created with ❤️ by the QuickHomies Team

---

**Ready to deploy? Check out [DEPLOYMENT.md](./DEPLOYMENT.md)**
