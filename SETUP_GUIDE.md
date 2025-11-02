# Setup Guide - Compass Network App

## ✅ What Has Been Done

### 1. **Cleaned Up Boilerplate**
- Removed default example components (themed-text, themed-view, etc.)
- Removed default tab navigation structure
- Removed modal example
- Removed unnecessary scripts

### 2. **Created Scalable Folder Structure**
```
src/
├── screens/          # All screen components organized by role
├── components/       # Reusable UI components
├── services/api/     # API integration layer
├── context/          # React Context for state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── constants/        # App constants
└── hooks/            # Custom React hooks
```

### 3. **Implemented Authentication System**
- **AuthContext**: Global authentication state management
- **API Client**: Axios with automatic token injection and error handling
- **Auth Service**: All 4 API endpoints integrated

### 4. **Created Role-Based Screens**

#### Authentication Screens:
- ✅ Login Screen
- ✅ Role Selection Screen
- ✅ Distributor Registration
- ✅ Company Registration
- ✅ Technician Registration

#### Dashboard Screens:
- ✅ Distributor Dashboard
- ✅ Company Dashboard
- ✅ Technician Dashboard

### 5. **Integrated 4 APIs**
```
Base URL: https://compassnetwork.runasp.net

1. POST /api/Auth/register-distributor
   - name, email, mobileNumber, password, confirmPassword

2. POST /api/Auth/register-company
   - companyName, companyEmail, gstNumber, mobileNumber, 
     companyAddress, password, confirmPassword, referCode

3. POST /api/Auth/register-technician/{companyId}
   - name, email, mobileNumber, password, confirmPassword

4. POST /api/Auth/login
   - email, password
```

### 6. **Installed Dependencies**
```
✅ axios - HTTP client
✅ @react-native-async-storage/async-storage - Local storage
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd MyApp
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Run on Device/Emulator
```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## 📱 App Flow

### Unauthenticated Users
```
Login Screen
    ↓
Role Selection Screen
    ↓
Registration Screen (based on role)
    ↓
Authenticated → Dashboard
```

### Authenticated Users
```
App Start
    ↓
Check Auth Status (AsyncStorage)
    ↓
If Token Valid → Show Role-Based Dashboard
If Token Invalid → Show Login Screen
```

## 🔐 Authentication Flow

1. **User Registration**
   - Select role (Distributor/Company/Technician)
   - Fill registration form
   - API call to register endpoint
   - Receive JWT token
   - Store token in AsyncStorage
   - Redirect to dashboard

2. **User Login**
   - Enter email & password
   - API call to login endpoint
   - Receive JWT token
   - Store token in AsyncStorage
   - Redirect to dashboard based on role

3. **Token Management**
   - Token automatically injected in all API requests
   - 401 errors clear token and redirect to login
   - Token persists across app restarts

## 📁 File Organization

### Key Files to Know:

**Authentication**
- `src/context/AuthContext.tsx` - Auth state management
- `src/services/api/authService.ts` - API calls
- `src/services/api/client.ts` - Axios configuration

**Screens**
- `src/screens/auth/` - Login & registration
- `src/screens/distributor/` - Distributor dashboard
- `src/screens/company/` - Company dashboard
- `src/screens/technician/` - Technician dashboard

**Types**
- `src/types/index.ts` - All TypeScript interfaces

**Navigation**
- `app/_layout.tsx` - Root layout with auth provider
- `app/auth/` - Auth route pages
- `app/distributor/`, `app/company/`, `app/technician/` - Role dashboards

## 🔧 Customization

### Adding New Features

1. **New API Endpoint**
   ```typescript
   // Add to src/services/api/authService.ts
   export const authService = {
     newEndpoint: async (data) => {
       const response = await apiClient.post('/api/endpoint', data);
       return response.data;
     }
   };
   ```

2. **New Screen**
   ```typescript
   // Create in src/screens/[role]/NewScreen.tsx
   // Then create route in app/[role]/new-screen.tsx
   ```

3. **New Type**
   ```typescript
   // Add to src/types/index.ts
   export interface NewType {
     // properties
   }
   ```

## 🎨 Styling

All screens use React Native StyleSheet for consistent styling:
- Primary color: `#007AFF` (Blue)
- Secondary colors: `#10B981` (Green), `#F59E0B` (Amber)
- Danger color: `#FF6B6B` (Red)

## 📝 Notes

- All API responses are typed with `ApiResponse<T>`
- Error handling is built into the API client
- Token is automatically refreshed on each request
- Logout clears token and redirects to login
- App supports offline mode (cached data)

## 🐛 Troubleshooting

**Issue**: "Cannot find module '@/src/...'"
- Solution: Check tsconfig.json path aliases are correct

**Issue**: "AsyncStorage not working"
- Solution: Ensure `@react-native-async-storage/async-storage` is installed

**Issue**: "API calls failing"
- Solution: Check base URL in `src/services/api/client.ts`
- Verify network connectivity
- Check API endpoint paths

## 📚 Next Steps

1. **Customize Dashboards**: Add role-specific features
2. **Add More Screens**: Create feature screens for each role
3. **Implement Services**: Add more API services as needed
4. **Add Validation**: Implement form validation
5. **Error Handling**: Add comprehensive error handling
6. **Testing**: Write unit and integration tests

## 📞 Support

For issues or questions, refer to:
- PROJECT_STRUCTURE.md - Detailed folder structure
- Individual screen files - Implementation examples
- API service files - API integration patterns

