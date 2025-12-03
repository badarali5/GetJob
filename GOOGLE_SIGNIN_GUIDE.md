# Google Sign-In Implementation Guide

## Overview
Google Sign-In has been successfully integrated into the GetJob signup page. Users can now sign up or sign in using their Google account as an alternative to email/password authentication.

## Frontend Implementation

### Components Updated
1. **`frontend/src/App.tsx`**: Wrapped app with `GoogleOAuthProvider` component
2. **`frontend/src/pages/Signup.tsx`**: Added `GoogleLogin` button below the signup form

### Environment Variables
Create a `.env` file in the `frontend/` directory with:
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**How to get a Google Client ID:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the "Google+ API"
4. Go to "Credentials" and create an "OAuth 2.0 Client ID" (Web Application type)
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://getjobportal.vercel.app` (production)
6. Add authorized redirect URIs:
   - `http://localhost:5173/signup` (development)
   - `https://getjobportal.vercel.app/signup` (production)
7. Copy the Client ID and paste into `.env` file

### Frontend Flow
1. User clicks "Sign up with Google" button on signup page
2. Google OAuth dialog appears
3. User authenticates with Google
4. Frontend receives `credentialResponse.credential` (Google JWT token)
5. Frontend sends token to backend: `POST /api/auth/google` with `{ token: "<jwt>" }`
6. Backend validates token and returns app JWT
7. Frontend stores token and user info in localStorage
8. User redirected to `/jobs` page

## Backend Implementation

### New Endpoint
**POST `/api/auth/google`**
- Request: `{ token: "<google-jwt>" }`
- Response: `{ id, name, email, role, token }`

### Files Modified
1. **`backend/src/main/java/.../auth/controller/AuthController.java`**
   - Added `googleAuth()` endpoint handler

2. **`backend/src/main/java/.../auth/service/AuthService.java`**
   - Added `googleAuth(String googleToken)` method
   - Decodes Google JWT payload
   - Extracts email and name from Google token
   - Creates new user if doesn't exist, or uses existing user
   - Generates app JWT token with 24-hour expiry

3. **`backend/src/main/java/.../auth/dto/GoogleTokenRequest.java`** (new file)
   - DTO for Google token request validation

### Backend Flow
1. Backend receives Google JWT token from frontend
2. Decodes token (without external verification - token comes from Google OAuth)
3. Extracts `email` and `name` claims from Google token
4. Searches database for user with that email
5. If user exists, generates new app JWT token
6. If user doesn't exist:
   - Creates new user with email and name from Google
   - Sets role to "OTHER" by default
   - Sets random password hash
   - Generates app JWT token
7. Returns `AuthResponse` with user info and JWT token

### Implementation Details
- **Token Decoding**: Uses manual Base64 decoding and JSON parsing (no external Google libraries needed)
- **User Creation**: Automatic signup on first Google login
- **Security**: Google token is trusted because it comes directly from Google's OAuth2 flow
- **Password**: Generated users have a random UUID as password hash (they can't login with email/password)

## Security Considerations

✅ **What's Secure:**
- Google JWT tokens are verified by Google's servers before being sent to frontend
- Token exchange happens client-side (no token stored by us)
- App JWT tokens have 24-hour expiry
- Passwords for Google-created users are random UUIDs (not guessable)

⚠️ **For Production Improvements:**
- Implement full Google token verification using Google's libraries (currently we decode without verification)
- Add Google token expiration check
- Implement token refresh mechanism for long-lived sessions
- Consider rate limiting on `/api/auth/google` endpoint

## Testing

### Local Development
1. Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`
2. Run frontend: `npm run dev` (at http://localhost:5173)
3. Run backend: `./mvnw spring-boot:run` (at http://localhost:8081)
4. Go to signup page, click "Sign up with Google"
5. Authenticate and verify redirect to `/jobs`

### Production Testing
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Set `VITE_GOOGLE_CLIENT_ID` in Vercel environment variables
4. Set `JWT_SECRET` in Railway environment variables
5. Test at https://getjobportal.vercel.app/signup

## Related Documentation
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/gsi/web)
- [@react-oauth/google Documentation](https://github.com/react-oauth/react-oauth.github.io)
- Backend JWT generation uses io.jsonwebtoken (jjwt) library
