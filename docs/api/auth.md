# Authentication API

## NextAuth.js Handler

### `GET/POST /api/auth/[...nextauth]`

NextAuth.js dynamic route handler that manages all authentication flows.

#### Supported Flows
- Sign in
- Sign out
- OAuth callbacks
- Session management
- CSRF protection

#### Configuration

The authentication is configured in `lib/auth.ts` with the following providers:
- Google OAuth
- Other providers as configured

#### Endpoints

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/[provider]` - Sign in with specific provider
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/callback/[provider]` - OAuth callback

#### Session Format

```typescript
interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  expires: string;
}
```

#### Example Usage

```javascript
// Get session
const session = await getSession();

// Sign in
await signIn('google');

// Sign out
await signOut();
```

#### Security Features

- CSRF protection
- Secure session handling
- OAuth state validation
- JWT token security

For more information, see the [NextAuth.js documentation](https://next-auth.js.org/).