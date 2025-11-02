# Project Structure

## Overview
This is a React Native (Expo) application with role-based authentication and separate dashboards for Distributors, Companies, and Technicians.

## Folder Structure

```
MyApp/
├── app/                          # Expo Router pages (entry points)
│   ├── _layout.tsx              # Root layout with auth provider
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx
│   │   ├── role-selection.tsx
│   │   ├── register-distributor.tsx
│   │   ├── register-company.tsx
│   │   └── register-technician.tsx
│   ├── distributor/             # Distributor role screens
│   │   └── dashboard.tsx
│   ├── company/                 # Company role screens
│   │   └── dashboard.tsx
│   └── technician/              # Technician role screens
│       └── dashboard.tsx
│
├── src/                         # Source code (business logic)
│   ├── screens/                 # Screen components
│   │   ├── auth/               # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RoleSelectionScreen.tsx
│   │   │   ├── RegisterDistributorScreen.tsx
│   │   │   ├── RegisterCompanyScreen.tsx
│   │   │   └── RegisterTechnicianScreen.tsx
│   │   ├── distributor/        # Distributor screens
│   │   │   └── DistributorDashboard.tsx
│   │   ├── company/            # Company screens
│   │   │   └── CompanyDashboard.tsx
│   │   └── technician/         # Technician screens
│   │       └── TechnicianDashboard.tsx
│   │
│   ├── components/             # Reusable components
│   │   ├── common/            # Common components (buttons, inputs, etc.)
│   │   └── auth/              # Auth-specific components
│   │
│   ├── services/              # API services
│   │   └── api/
│   │       ├── client.ts      # Axios client with interceptors
│   │       └── authService.ts # Authentication API calls
│   │
│   ├── context/               # React Context
│   │   └── AuthContext.tsx    # Authentication context & provider
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts          # All type definitions
│   │
│   ├── utils/                 # Utility functions
│   ├── constants/             # App constants
│   └── hooks/                 # Custom React hooks
│
├── assets/                    # Images, fonts, etc.
├── constants/                 # App-wide constants
├── hooks/                     # Custom hooks
├── package.json
├── tsconfig.json
└── app.json
```

## Key Features

### 1. Authentication System
- **Three user roles**: Distributor, Company, Technician
- **Separate registration flows** for each role
- **JWT token-based authentication**
- **Persistent login** using AsyncStorage

### 2. API Integration
- **Base URL**: https://compassnetwork.runasp.net
- **Endpoints**:
  - `POST /api/Auth/register-distributor`
  - `POST /api/Auth/register-company`
  - `POST /api/Auth/register-technician/{companyId}`
  - `POST /api/Auth/login`

### 3. Role-Based Navigation
- Users are routed to their respective dashboards based on role
- Automatic logout and redirect to login on token expiration

### 4. State Management
- **AuthContext** for global authentication state
- **AsyncStorage** for persistent token storage

## Getting Started

### Installation
```bash
cd MyApp
npm install
```

### Running the App
```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

## API Service Usage

### Authentication Service
```typescript
import { authService } from '@/services/api/authService';

// Register Distributor
const response = await authService.registerDistributor({
  name: 'John Doe',
  email: 'john@example.com',
  mobileNumber: '1234567890',
  password: 'password123',
  confirmPassword: 'password123'
});

// Login
const loginResponse = await authService.login({
  email: 'john@example.com',
  password: 'password123'
});
```

## Using Auth Context

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, token, isSignedIn, logout } = useAuth();
  
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Text>Role: {user?.role}</Text>
    </View>
  );
}
```

## Scaling the Project

### Adding New Features
1. Create new screens in `src/screens/[role]/`
2. Add new API services in `src/services/api/`
3. Create new routes in `app/[role]/`
4. Add types in `src/types/index.ts`

### Adding New Roles
1. Create new registration screen
2. Add new dashboard screen
3. Update AuthContext if needed
4. Add new routes in `app/_layout.tsx`

## Dependencies
- **expo-router**: File-based routing
- **axios**: HTTP client
- **@react-native-async-storage/async-storage**: Local storage
- **@react-navigation**: Navigation library
- **react-native-reanimated**: Animations

## Notes
- All API calls include automatic token injection via interceptors
- Unauthorized requests (401) automatically clear token and redirect to login
- Type safety is enforced with TypeScript

