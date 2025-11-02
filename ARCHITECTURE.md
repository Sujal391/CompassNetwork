# Application Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native (Expo) App                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    App Entry Point                        │   │
│  │                   (app/_layout.tsx)                       │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              AuthProvider (Context)                      │   │
│  │         Manages global auth state & token               │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│        ┌──────────────────┼──────────────────┐                  │
│        │                  │                  │                  │
│        ▼                  ▼                  ▼                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Screens │  │ Distributor  │  │   Company    │          │
│  │              │  │  Dashboard   │  │  Dashboard   │          │
│  │ • Login      │  │              │  │              │          │
│  │ • Register   │  │ • Orders     │  │ • Technicians│          │
│  │ • Role Sel.  │  │ • Inventory  │  │ • Projects   │          │
│  └──────────────┘  │ • Reports    │  │ • Analytics  │          │
│                    └──────────────┘  └──────────────┘          │
│                                                                   │
│        ┌──────────────────────────────────────────┐             │
│        │                                          │             │
│        ▼                                          ▼             │
│  ┌──────────────────────────────────────────────────────┐      │
│  │          Technician Dashboard                        │      │
│  │                                                      │      │
│  │  • My Tasks  • Work History  • Performance  • Profile│      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      Services Layer (src/services)      │
        ├─────────────────────────────────────────┤
        │                                         │
        │  ┌─────────────────────────────────┐   │
        │  │   API Client (Axios)            │   │
        │  │                                 │   │
        │  │ • Base URL Configuration        │   │
        │  │ • Request Interceptors          │   │
        │  │ • Response Interceptors         │   │
        │  │ • Token Injection               │   │
        │  │ • Error Handling                │   │
        │  └────────────┬────────────────────┘   │
        │               │                        │
        │               ▼                        │
        │  ┌─────────────────────────────────┐   │
        │  │   Auth Service                  │   │
        │  │                                 │   │
        │  │ • registerDistributor()         │   │
        │  │ • registerCompany()             │   │
        │  │ • registerTechnician()          │   │
        │  │ • login()                       │   │
        │  └─────────────────────────────────┘   │
        │                                         │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      Backend API Server                 │
        ├─────────────────────────────────────────┤
        │  https://compassnetwork.runasp.net      │
        │                                         │
        │  POST /api/Auth/register-distributor   │
        │  POST /api/Auth/register-company       │
        │  POST /api/Auth/register-technician    │
        │  POST /api/Auth/login                  │
        │                                         │
        └─────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Authentication Flow

```
User Input
    │
    ▼
┌─────────────────────────┐
│  Validation             │
│  (Email, Password, etc) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  API Call               │
│  (authService)          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Axios Client           │
│  (Add Token, Headers)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Backend API            │
│  (Process Request)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Response               │
│  (Token + User Data)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Store in AsyncStorage  │
│  (Token + User)         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Update AuthContext     │
│  (Global State)         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Navigate to Dashboard  │
│  (Based on Role)        │
└─────────────────────────┘
```

---

## Component Hierarchy

```
RootLayout (_layout.tsx)
├── AuthProvider (Context)
│   └── RootLayoutNav
│       ├── Auth Stack (if not signed in)
│       │   ├── LoginScreen
│       │   ├── RoleSelectionScreen
│       │   ├── RegisterDistributorScreen
│       │   ├── RegisterCompanyScreen
│       │   └── RegisterTechnicianScreen
│       │
│       └── Role Stack (if signed in)
│           ├── DistributorDashboard (if role === 'distributor')
│           ├── CompanyDashboard (if role === 'company')
│           └── TechnicianDashboard (if role === 'technician')
```

---

## State Management

```
┌──────────────────────────────────────┐
│      AuthContext (Global State)      │
├──────────────────────────────────────┤
│                                      │
│  user: User | null                   │
│  ├── id: string                      │
│  ├── email: string                   │
│  ├── name: string                    │
│  ├── role: UserRole                  │
│  └── companyId?: string              │
│                                      │
│  token: string | null                │
│  isLoading: boolean                  │
│  isSignedIn: boolean                 │
│                                      │
│  Methods:                            │
│  ├── setUser()                       │
│  ├── setToken()                      │
│  ├── logout()                        │
│  └── checkAuthStatus()               │
│                                      │
└──────────────────────────────────────┘
         │
         │ Consumed by
         │
    ┌────┴────┬────────┬──────────┐
    │          │        │          │
    ▼          ▼        ▼          ▼
  Login    Register  Dashboard  Navigation
  Screen   Screens   Screens    Logic
```

---

## API Request/Response Flow

```
┌─────────────────────────────────────────────────────────┐
│                   API Request                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Create Request                                      │
│     └─ authService.login({ email, password })          │
│                                                         │
│  2. Request Interceptor                                 │
│     └─ Add Authorization header with token             │
│     └─ Add Content-Type: application/json              │
│                                                         │
│  3. Send to Backend                                     │
│     └─ POST https://compassnetwork.runasp.net/...      │
│                                                         │
│  4. Receive Response                                    │
│     └─ { success, data, message, errors }              │
│                                                         │
│  5. Response Interceptor                                │
│     └─ Check status code                               │
│     └─ If 401: Clear token, redirect to login          │
│     └─ If error: Reject promise                        │
│                                                         │
│  6. Return to Component                                 │
│     └─ Handle success or error                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## File Organization

```
MyApp/
│
├── app/                          # Expo Router Pages
│   ├── _layout.tsx              # Root layout
│   ├── auth/                    # Auth routes
│   ├── distributor/             # Distributor routes
│   ├── company/                 # Company routes
│   └── technician/              # Technician routes
│
├── src/                         # Business Logic
│   ├── screens/                 # Screen components
│   │   ├── auth/
│   │   ├── distributor/
│   │   ├── company/
│   │   └── technician/
│   │
│   ├── components/              # Reusable components
│   │   ├── common/
│   │   └── auth/
│   │
│   ├── services/                # API services
│   │   └── api/
│   │       ├── client.ts
│   │       └── authService.ts
│   │
│   ├── context/                 # State management
│   │   └── AuthContext.tsx
│   │
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/                   # Utilities
│   ├── constants/               # Constants
│   └── hooks/                   # Custom hooks
│
├── assets/                      # Images, fonts
├── package.json
├── tsconfig.json
└── app.json
```

---

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Frontend Framework               │
│  React Native 0.81.5 + Expo 54.0.20    │
└─────────────────────────────────────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
Navigation  State      HTTP      Storage
Expo Router Context    Axios     AsyncStorage
    │          │          │          │
    └────┬─────┴──────┬───┴──────┬───┘
         │            │          │
         ▼            ▼          ▼
    TypeScript  React Hooks  React Native
```

---

## Security Architecture

```
┌──────────────────────────────────────────┐
│         Security Layers                  │
├──────────────────────────────────────────┤
│                                          │
│  1. HTTPS/TLS                            │
│     └─ All API calls encrypted           │
│                                          │
│  2. JWT Token                            │
│     └─ Stateless authentication          │
│     └─ Token in Authorization header     │
│                                          │
│  3. AsyncStorage                         │
│     └─ Secure local token storage        │
│     └─ Cleared on logout                 │
│                                          │
│  4. Request Validation                   │
│     └─ Input validation before API call  │
│     └─ Type checking with TypeScript     │
│                                          │
│  5. Error Handling                       │
│     └─ 401 errors trigger logout         │
│     └─ Sensitive data not logged         │
│                                          │
└──────────────────────────────────────────┘
```

---

## Scaling Considerations

```
Current Architecture (Single Role)
    │
    ├─ Add New Role
    │   └─ Create new screen
    │   └─ Add to navigation
    │   └─ Update types
    │
    ├─ Add New Feature
    │   └─ Create new screen
    │   └─ Add API service
    │   └─ Update context if needed
    │
    └─ Add New API Service
        └─ Create new service file
        └─ Add types
        └─ Use in components
```

This architecture is designed to scale easily as your application grows!

