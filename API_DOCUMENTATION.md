# API Documentation

## Base URL
```
https://compassnetwork.runasp.net
```

## Authentication

All authenticated requests require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

The token is automatically injected by the API client in `src/services/api/client.ts`.

## Endpoints

### 1. Register Distributor

**Endpoint**: `POST /api/Auth/register-distributor`

**Request Body**:
```typescript
{
  name: string;              // Full name of distributor
  email: string;             // Email address
  mobileNumber: string;      // Phone number
  password: string;          // Password (min 6 chars recommended)
  confirmPassword: string;   // Must match password
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    token: string;           // JWT token for authentication
    user: {
      id: string;
      email: string;
      name: string;
      role: "distributor";
    }
  }
}
```

**Example Usage**:
```typescript
import { authService } from '@/services/api/authService';

const response = await authService.registerDistributor({
  name: 'John Doe',
  email: 'john@example.com',
  mobileNumber: '9876543210',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123'
});

if (response.data) {
  const { token, user } = response.data;
  // Store token and user
}
```

---

### 2. Register Company

**Endpoint**: `POST /api/Auth/register-company`

**Request Body**:
```typescript
{
  companyName: string;       // Official company name
  companyEmail: string;      // Company email address
  gstNumber: string;         // GST registration number
  mobileNumber: string;      // Company phone number
  companyAddress: string;    // Full company address
  password: string;          // Password
  confirmPassword: string;   // Must match password
  referCode: string;         // Referral code (optional)
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;           // Company name
      role: "company";
      companyId: string;      // Company ID for technician registration
    }
  }
}
```

**Example Usage**:
```typescript
const response = await authService.registerCompany({
  companyName: 'Tech Solutions Ltd',
  companyEmail: 'info@techsolutions.com',
  gstNumber: '18AABCT1234H1Z0',
  mobileNumber: '9876543210',
  companyAddress: '123 Business Park, City, State 12345',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  referCode: 'REF123'  // Optional
});
```

---

### 3. Register Technician

**Endpoint**: `POST /api/Auth/register-technician/{companyId}`

**Path Parameters**:
- `companyId` (integer, required): The ID of the company the technician belongs to

**Request Body**:
```typescript
{
  name: string;              // Technician's full name
  email: string;             // Email address
  mobileNumber: string;      // Phone number
  password: string;          // Password
  confirmPassword: string;   // Must match password
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: "technician";
      companyId: string;     // Associated company ID
    }
  }
}
```

**Example Usage**:
```typescript
const companyId = '12345';  // Get from company admin
const response = await authService.registerTechnician(companyId, {
  name: 'Jane Smith',
  email: 'jane@example.com',
  mobileNumber: '9876543210',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123'
});
```

---

### 4. Login

**Endpoint**: `POST /api/Auth/login`

**Request Body**:
```typescript
{
  email: string;             // User email
  password: string;          // User password
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    token: string;           // JWT token
    user: {
      id: string;
      email: string;
      name: string;
      role: "distributor" | "company" | "technician";
      companyId?: string;    // Only for technician
    }
  }
}
```

**Example Usage**:
```typescript
const response = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123'
});

if (response.data) {
  const { token, user } = response.data;
  // User is now authenticated
  // Token is automatically stored and used for future requests
}
```

---

## Error Handling

All API errors are handled by the client. Common error responses:

```typescript
{
  success: false;
  message: string;           // Error message
  errors?: {
    [field: string]: string[] // Field-specific errors
  }
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `404` - Not Found
- `500` - Server Error

**Example Error Handling**:
```typescript
try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'wrong'
  });
} catch (error: any) {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  console.error('Login failed:', errorMessage);
}
```

---

## Token Management

### Automatic Token Injection
The API client automatically adds the token to all requests:
```typescript
// In src/services/api/client.ts
this.client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Token Storage
Tokens are stored in AsyncStorage:
```typescript
// After successful login/registration
await AsyncStorage.setItem('authToken', token);
await AsyncStorage.setItem('user', JSON.stringify(user));
```

### Token Retrieval
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { token, user } = useAuth();
  // Use token and user
}
```

---

## Rate Limiting

No specific rate limiting mentioned in API docs. Implement client-side throttling if needed.

---

## CORS

The API supports CORS requests from web and mobile clients.

---

## Best Practices

1. **Always validate input** before sending to API
2. **Handle errors gracefully** with user-friendly messages
3. **Store tokens securely** (AsyncStorage is used)
4. **Implement token refresh** if API supports it
5. **Log errors** for debugging
6. **Test with real data** before production

---

## Testing

### Test Credentials (if available)
Contact your API provider for test credentials.

### Testing Registration
```typescript
// Test distributor registration
const testDistributor = {
  name: 'Test Distributor',
  email: `test-${Date.now()}@example.com`,
  mobileNumber: '9876543210',
  password: 'TestPass123',
  confirmPassword: 'TestPass123'
};

const response = await authService.registerDistributor(testDistributor);
console.log('Registration response:', response);
```

---

## Support

For API issues or questions:
1. Check the error message returned by the API
2. Verify all required fields are provided
3. Ensure the base URL is correct
4. Check network connectivity
5. Contact API support if issues persist

