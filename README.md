# Compass Network - React Native App

A professional, scalable React Native (Expo) application with role-based authentication and integration with 4 API endpoints.

## 🚀 Quick Start

```bash
cd MyApp
npm install
npm start
```

Then press:
- `a` for Android
- `i` for iOS  
- `w` for Web

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - Start here! Quick reference guide
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup and configuration

### Understanding the Project
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Folder structure and organization
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and data flow
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built

### Development
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints and usage
- **[CHECKLIST.md](./CHECKLIST.md)** - Project completion checklist

## ✨ Features

✅ **Role-Based Authentication**
- Distributor registration & login
- Company registration & login
- Technician registration & login

✅ **4 Integrated APIs**
- `POST /api/Auth/register-distributor`
- `POST /api/Auth/register-company`
- `POST /api/Auth/register-technician/{companyId}`
- `POST /api/Auth/login`

✅ **Professional Architecture**
- Clean, scalable folder structure
- Separation of concerns
- TypeScript for type safety
- React Context for state management
- Axios with interceptors

✅ **User Experience**
- Persistent login (AsyncStorage)
- Automatic token injection
- Error handling & user feedback
- Loading states
- Role-based dashboards

## 📁 Project Structure

```
MyApp/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with auth
│   ├── auth/              # Login & registration
│   ├── distributor/       # Distributor dashboard
│   ├── company/           # Company dashboard
│   └── technician/        # Technician dashboard
│
├── src/                   # Business logic
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   ├── services/api/      # API integration
│   ├── context/           # State management
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   ├── constants/         # Constants
│   └── hooks/             # Custom hooks
│
└── assets/                # Images, fonts, etc.
```

## 🔐 Authentication Flow

```
User Opens App
    ↓
Check Stored Token
    ↓
Token Valid? → Show Dashboard
Token Invalid? → Show Login
    ↓
User Registers/Logs In
    ↓
Receive JWT Token
    ↓
Store Token & Show Dashboard
```

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5
- **Platform**: Expo 54.0.20
- **Routing**: Expo Router
- **HTTP Client**: Axios
- **State Management**: React Context
- **Storage**: AsyncStorage
- **Language**: TypeScript
- **Styling**: React Native StyleSheet

## 📱 Supported Platforms

- ✅ iOS
- ✅ Android
- ✅ Web

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root navigation & auth provider |
| `src/context/AuthContext.tsx` | Authentication state |
| `src/services/api/authService.ts` | API endpoints |
| `src/services/api/client.ts` | Axios configuration |
| `src/types/index.ts` | TypeScript types |

## 💡 Common Tasks

### Add a New Screen
1. Create screen in `src/screens/[role]/NewScreen.tsx`
2. Create route in `app/[role]/new-screen.tsx`
3. Add navigation link

### Call an API
```typescript
import { authService } from '@/services/api/authService';

const response = await authService.login({
  email: 'user@example.com',
  password: 'password'
});
```

### Use Auth Context
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  return <Text>Welcome, {user?.name}</Text>;
}
```

## 🔗 API Base URL

```
https://compassnetwork.runasp.net
```

## 🎨 Design System

- **Primary Color**: `#007AFF` (Blue)
- **Success Color**: `#10B981` (Green)
- **Warning Color**: `#F59E0B` (Amber)
- **Danger Color**: `#FF6B6B` (Red)

## 📊 Project Status

✅ **Complete & Ready for Development**

- ✅ Clean architecture
- ✅ Full authentication system
- ✅ 4 APIs integrated
- ✅ Role-based dashboards
- ✅ Professional UI/UX
- ✅ Comprehensive documentation

## 🚀 Next Steps

1. **Test the app** - Run `npm start` and test authentication
2. **Customize dashboards** - Add role-specific features
3. **Add more screens** - Create feature screens
4. **Deploy** - Build and deploy to app stores

## 📞 Support

### Documentation
- Check the relevant `.md` file in the project root
- Each file has detailed explanations and examples

### Troubleshooting
- **App won't start?** → See SETUP_GUIDE.md
- **API issues?** → See API_DOCUMENTATION.md
- **Architecture questions?** → See ARCHITECTURE.md

### External Resources
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Axios Docs](https://axios-http.com)

## 📝 License

This project is ready for development and deployment.

## 🎉 Ready to Build?

Start with **[QUICK_START.md](./QUICK_START.md)** for immediate next steps!

---

**Built with ❤️ using React Native & Expo**

