# Quick Start Guide

## 🎯 What's Ready to Use

Your React Native (Expo) app is fully set up with:
- ✅ Clean, scalable folder structure
- ✅ Role-based authentication (Distributor, Company, Technician)
- ✅ 4 API endpoints integrated
- ✅ JWT token management
- ✅ Persistent login
- ✅ Role-based dashboards

## 🚀 Start the App

```bash
cd MyApp
npm install  # If not already done
npm start
```

Then choose:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web

## 📱 Test the App

### 1. **Login Screen**
- First screen you'll see
- Enter email and password
- Or click "Register" to create new account

### 2. **Role Selection**
- Choose: Distributor, Company, or Technician
- Each has its own registration form

### 3. **Registration**
- **Distributor**: Name, Email, Mobile, Password
- **Company**: Company Name, Email, GST, Mobile, Address, Password, Referral Code
- **Technician**: Company ID, Name, Email, Mobile, Password

### 4. **Dashboard**
- After login, see role-specific dashboard
- Each role has different menu items
- Click "Logout" to return to login

## 📂 Key Files to Know

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root navigation & auth provider |
| `src/context/AuthContext.tsx` | Authentication state |
| `src/services/api/authService.ts` | API calls |
| `src/services/api/client.ts` | Axios configuration |
| `src/types/index.ts` | TypeScript types |
| `src/screens/auth/` | Login & registration screens |
| `src/screens/[role]/` | Role dashboards |

## 🔧 Common Tasks

### Add a New Screen
```typescript
// 1. Create screen in src/screens/[role]/NewScreen.tsx
export const NewScreen = ({ navigation }) => {
  return <View>...</View>;
};

// 2. Create route in app/[role]/new-screen.tsx
import { NewScreen } from '@/src/screens/[role]/NewScreen';
import { useRouter } from 'expo-router';

export default function NewScreenPage() {
  const router = useRouter();
  return <NewScreen navigation={router} />;
}
```

### Call an API
```typescript
import { authService } from '@/services/api/authService';

const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Use Auth Context
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, token, logout } = useAuth();
  
  return <Text>Welcome, {user?.name}</Text>;
}
```

### Add New API Endpoint
```typescript
// In src/services/api/authService.ts
export const authService = {
  // ... existing endpoints
  
  newEndpoint: async (data) => {
    const response = await apiClient.post('/api/new-endpoint', data);
    return response.data;
  }
};
```

## 🎨 Styling

All screens use React Native StyleSheet. Colors:
- **Primary**: `#007AFF` (Blue)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#FF6B6B` (Red)

## 🔐 How Authentication Works

1. **User registers** → API returns token
2. **Token stored** in AsyncStorage
3. **Token auto-injected** in all API requests
4. **401 error** → Token cleared, redirect to login
5. **App restart** → Token restored from storage

## 📋 API Endpoints

```
Base: https://compassnetwork.runasp.net

POST /api/Auth/register-distributor
POST /api/Auth/register-company
POST /api/Auth/register-technician/{companyId}
POST /api/Auth/login
```

## 🐛 Troubleshooting

**App won't start?**
- Run `npm install` again
- Clear cache: `npm start -- --clear`

**API calls failing?**
- Check internet connection
- Verify base URL in `src/services/api/client.ts`
- Check API endpoint paths

**Can't find modules?**
- Verify path aliases in `tsconfig.json`
- Restart dev server

**AsyncStorage not working?**
- Ensure package is installed: `npm install @react-native-async-storage/async-storage`

## 📚 Documentation

- **PROJECT_STRUCTURE.md** - Detailed folder structure
- **SETUP_GUIDE.md** - Complete setup instructions
- **Individual files** - Code comments and examples

## 🎓 Learning Resources

- [Expo Router Docs](https://expo.dev/router)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Axios Docs](https://axios-http.com)

## ✨ Next Steps

1. **Customize dashboards** - Add role-specific features
2. **Add more screens** - Create feature screens
3. **Implement services** - Add more API services
4. **Add validation** - Form validation
5. **Write tests** - Unit & integration tests
6. **Deploy** - Build and deploy to stores

---

**Happy coding! 🚀**

