# PrepBoard Authentication + Landing Page Implementation Plan

## 1. Objective

PrepBoard currently has a working React + Express + MongoDB application with:

- Application CRUD
- Search and filtering
- Application details
- Statistics/dashboard
- Persistent MongoDB storage
- NLP/chatbot commands for creating, updating, and deleting applications

The next milestone is to introduce authentication and a public landing page.

The application should become a multi-user application where:

1. Unauthenticated users see a public landing page.
2. Users can sign up with email + password.
3. Existing users can sign in with email + password.
4. Authenticated users are taken to the PrepBoard dashboard.
5. Each user's applications are private and only accessible to that user.
6. React Router controls navigation between public and protected pages.
7. The existing dashboard functionality must continue to work.
8. The visual design must remain consistent with the existing monochrome/light-colour PrepBoard theme.

---

# 2. Important Implementation Decision

## Use Email + Password Authentication for this milestone

Do NOT implement Google OAuth in this milestone.

Reason:

- Email/password authentication is substantially simpler to implement with the existing Express + MongoDB backend.
- It avoids OAuth provider configuration, callback URLs, client IDs, secrets, and deployment-specific configuration.
- It is enough to establish the complete authentication architecture.
- Google Sign-In can be added later as a separate feature.

The architecture should be designed so Google OAuth could be added later without rewriting the application.

---

# 3. Existing Architecture

The current application is approximately:

Frontend:

React + Vite + Tailwind/CSS

Backend:

Node.js + Express

Database:

MongoDB Atlas + Mongoose

Current data flow:

React
    ↓
Express REST API
    ↓
MongoDB

New data flow:

React
    ↓
Authentication
    ↓
Express REST API
    ↓
MongoDB

Every application request must now be associated with the authenticated user.

---

# 4. Authentication Architecture

Use:

- Express
- MongoDB
- Mongoose
- bcryptjs for password hashing
- jsonwebtoken for authentication
- cookie-parser if required
- httpOnly cookie for the JWT/session token
- dotenv for secrets
- cors configured for credentials

Do NOT store passwords in plaintext.

Do NOT store the JWT in localStorage.

Prefer an httpOnly cookie so JavaScript running in the browser cannot directly access the authentication token.

---

# 5. User Model

Create:

backend/models/User.js

Schema:

- name
- email
- password
- createdAt
- updatedAt

Requirements:

- email must be required
- email must be unique
- email should be normalized to lowercase
- password must be stored only as a bcrypt hash
- never return the password hash in API responses

The User model should use Mongoose timestamps.

Example conceptual document:

{
  "_id": "...",
  "name": "Heet",
  "email": "example@email.com",
  "password": "<bcrypt hash>",
  "createdAt": "...",
  "updatedAt": "..."
}

---

# 6. Application Model Changes

The existing Application model must now belong to a user.

Add:

userId

This should reference:

User._id

Example:

{
  "_id": "...",
  "userId": "...",
  "companyName": "Google",
  "role": "SDE Intern",
  "status": "Applied",
  ...
}

Important:

Do NOT allow the frontend to decide which userId an application belongs to.

The backend must obtain the authenticated user's ID from the authentication middleware.

---

# 7. Critical Security Requirement

Every application database operation must be scoped to the authenticated user.

For example:

GET applications:

Find only:

{
  userId: authenticatedUserId
}

Do NOT do:

Application.find()

because that would expose every user's applications.

Likewise:

- GET application by ID
- POST application
- PUT application
- DELETE application

must all enforce ownership.

A user must never be able to access or modify another user's application simply by changing an application ID in the request.

---

# 8. Authentication API

Create authentication routes such as:

POST /api/auth/signup

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

---

## POST /api/auth/signup

Request:

{
  "name": "Heet",
  "email": "example@email.com",
  "password": "password"
}

Process:

1. Validate fields.
2. Normalize email.
3. Check whether the email already exists.
4. Hash the password with bcrypt.
5. Create the User.
6. Create authentication session/JWT.
7. Set the token in an httpOnly cookie.
8. Return safe user information.

Never return the password or password hash.

---

## POST /api/auth/login

Process:

1. Validate email/password.
2. Find user.
3. Compare password using bcrypt.
4. Create JWT.
5. Set JWT in httpOnly cookie.
6. Return safe user information.

Incorrect credentials should return an appropriate 401 response.

Do not reveal whether the email exists separately from whether the password is incorrect.

---

## POST /api/auth/logout

Clear the authentication cookie.

Return a successful JSON response.

---

## GET /api/auth/me

This endpoint should:

1. Read the authentication cookie.
2. Verify the JWT.
3. Find the user.
4. Return safe user information.

If the user is not authenticated, return 401.

The frontend will use this endpoint when the application starts to determine whether a session already exists.

---

# 9. Authentication Middleware

Create something like:

backend/middleware/authMiddleware.js

Responsibilities:

1. Read the JWT from the httpOnly cookie.
2. Verify it using a secret from .env.
3. Extract the user ID.
4. Attach the authenticated user ID to the request.
5. Reject unauthenticated requests with HTTP 401.

Example conceptual flow:

Request
    ↓
authMiddleware
    ↓
Verify JWT
    ↓
req.user = authenticated user
    ↓
Controller

Do not trust a user ID supplied by the frontend.

---

# 10. Environment Variables

The backend .env should contain values conceptually like:

PORT=5000
MONGO_URI=...
JWT_SECRET=...

Do NOT commit .env.

Do NOT hardcode JWT_SECRET.

Do NOT expose JWT_SECRET to the frontend.

The agent must NOT print or expose the actual MongoDB password or JWT secret in documentation or code comments.

Update .env.example if useful, using placeholders only.

---

# 11. React Router Architecture

Use React Router.

The routing logic should be defined in:

Project/src/App.jsx

Use the standard React Router structure:

BrowserRouter
    ↓
Routes
    ↓
Route

Do not create a completely separate routing system.

---

# 12. Required Routes

Public routes:

/

 /login

 /signup

Protected route:

/dashboard

Optional protected routes can be added later for:

/applications/:id

if the current application-details implementation benefits from URL-based routing.

---

# 13. Page Structure

Create a clear page structure.

Suggested:

src/
    pages/
        LandingPage.jsx
        LoginPage.jsx
        SignupPage.jsx
        DashboardPage.jsx

    components/
        Navbar.jsx
        ProtectedRoute.jsx
        ...

Do not blindly move the entire existing dashboard into dozens of components.

Keep the existing architecture understandable.

The existing dashboard can be moved into DashboardPage.jsx with minimal changes if necessary.

---

# 14. Landing Page

Create a public landing page at:

/

Purpose:

Introduce PrepBoard to a new visitor.

The landing page should contain:

## Hero section

PrepBoard

A concise headline explaining the product.

Example concept:

"Your command center for internship and interview applications."

Supporting text should explain that PrepBoard helps users track applications, preparation, interviews, and progress.

Buttons:

- Get Started / Sign Up
- Log In

---

## Feature section

Highlight existing functionality rather than inventing features.

For example:

- Application Tracking
- Search & Filtering
- Application Analytics
- Interview Preparation
- NLP-powered Application Management
- Persistent Cloud Data

Only mention features that actually exist in the current application.

---

## How It Works section

Simple three-step explanation:

1. Track your applications.
2. Prepare for interviews.
3. Stay organized and monitor progress.

---

## Call to Action

End with a simple:

"Start using PrepBoard"

with a Sign Up button.

---

# 15. Landing Page Design

The landing page must NOT look like a completely different product.

Maintain the existing PrepBoard visual identity.

Theme requirements:

- monochrome
- light colours
- clean
- minimal
- professional
- subtle borders
- restrained use of shadows
- strong typography hierarchy
- no excessive gradients
- no neon colours
- no visually noisy illustrations
- no unnecessary animations

Use the same typography, spacing, border radius, button treatment, and visual language already established in the dashboard wherever practical.

The landing page should feel like:

"PrepBoard before login"

rather than:

"a separate marketing website."

---

# 16. Login Page

Create:

/login

Include:

- PrepBoard branding
- Email field
- Password field
- Sign In button
- Link to Sign Up
- Error message area
- Loading state

Optional:

- Show/hide password

Do NOT add Google Sign-In yet.

After successful login:

Navigate to:

/dashboard

---

# 17. Signup Page

Create:

/signup

Fields:

- Name
- Email
- Password
- Confirm Password

Client-side validation:

- Required fields
- Valid email format
- Password minimum length
- Password confirmation matches

The backend must also validate these values.

Do not rely only on frontend validation.

After successful signup:

Either:

- automatically authenticate and navigate to /dashboard

OR

- navigate to /login with a clear success message.

Prefer automatic authentication if the implementation remains simple.

---

# 18. Authentication State in React

Create a simple authentication state.

Do NOT introduce Redux.

Do NOT introduce a large global state library.

A simple approach is acceptable:

- Auth state stored in App.jsx or a small Auth context if absolutely necessary.

Because authentication affects multiple routes, a small AuthContext is acceptable if it makes the implementation significantly cleaner.

However, do not create unnecessary abstraction.

---

# 19. Initial Authentication Check

When the application starts:

Call:

GET /api/auth/me

If authenticated:

set the current user

If unauthenticated:

mark authentication as resolved

Important:

Do not immediately redirect before this request finishes.

Use an initial loading state to avoid redirect flickering.

Conceptual state:

isAuthLoading
user

---

# 20. ProtectedRoute

Create:

ProtectedRoute.jsx

Behavior:

If authentication is still being checked:

Show a minimal loading state.

If no authenticated user:

Navigate to /login.

If authenticated:

Render the protected page.

Conceptually:

<ProtectedRoute>
    <DashboardPage />
</ProtectedRoute>

---

# 21. Dashboard Behavior After Authentication

The existing dashboard should remain functionally identical.

After authentication:

/dashboard

The dashboard should load only the current user's applications.

The backend handles the ownership filtering.

The frontend must NOT fetch all users' applications and filter them locally.

---

# 22. Existing NLP Chatbot

The existing NLP chatbot must continue to work.

Its backend operations must now use the authenticated user.

For example:

User A says:

"I applied to Google for SDE intern."

The chatbot creates the application with:

userId = User A

User B must never see that application.

Likewise:

- chatbot update
- chatbot delete
- chatbot search

must operate only within the authenticated user's data.

Do not create a separate authentication mechanism for the chatbot.

Reuse the existing authentication middleware.

---

# 23. Existing CRUD APIs

Update the existing application endpoints so they require authentication:

GET /api/applications

POST /api/applications

PUT /api/applications/:id

DELETE /api/applications/:id

Every route should use auth middleware.

Conceptual:

router.get("/", authMiddleware, getApplications)

router.post("/", authMiddleware, createApplication)

etc.

---

# 24. Existing Application Details

Preserve all existing functionality.

The user should still be able to:

- view application details
- edit applications
- delete applications
- search
- filter
- view analytics/statistics
- use the NLP chatbot

Authentication should not break these features.

---

# 25. Existing Data Migration

This is important.

There may already be application documents in MongoDB that were created before authentication existed.

Do NOT silently delete existing application data.

Before implementation, inspect the current Application model and database assumptions.

Choose the simplest safe migration strategy.

Preferred approach for a personal project:

Create a one-time migration script that can assign existing applications to a specified user ID after that user signs up.

Example concept:

backend/scripts/migrateApplications.js

The script should NOT run automatically during normal server startup.

Document how to run it.

If there are no existing applications that need preservation, document that no migration is necessary.

---

# 26. Error Handling

Use consistent JSON responses.

Success example:

{
  "success": true,
  "data": ...
}

Failure example:

{
  "success": false,
  "message": "..."
}

Use appropriate HTTP status codes:

200
201
400
401
403
404
409
500

Do not expose stack traces or sensitive backend details to the frontend.

---

# 27. CORS and Cookies

Because authentication uses cookies, configure CORS correctly.

The development frontend is currently expected to run on the Vite development server.

Allow credentials.

Frontend fetch requests that require authentication should use:

credentials: "include"

Do not use wildcard CORS with credentialed requests.

The exact frontend origin should be configured appropriately.

---

# 28. Security Requirements

Implement the following minimum protections:

- bcrypt password hashing
- JWT stored in httpOnly cookie
- JWT secret stored in .env
- user ownership checks
- backend validation
- no password returned in API responses
- no secrets in frontend code
- no secrets committed to Git
- appropriate CORS configuration

Do NOT overengineer security for this milestone.

Do NOT add OAuth, refresh-token rotation, email verification, password reset, CAPTCHA, or 2FA yet.

These can be future milestones.

---

# 29. React Router Navigation

Use React Router navigation rather than manually changing window.location.

Examples:

Navigate to login:

/login

Navigate to signup:

/signup

Navigate to dashboard:

/dashboard

Use Link/NavLink where appropriate.

Do not use anchor tags for internal React routes unless there is a specific reason.

---

# 30. Logout

Add a logout action to the authenticated application UI.

When clicked:

1. Call POST /api/auth/logout.
2. Clear the frontend user state.
3. Navigate to /login or /.
4. Ensure protected routes can no longer be accessed.

Prefer redirecting to the landing page after logout.

---

# 31. Navbar

Create a simple public navbar for the landing page.

It should contain:

PrepBoard logo/name

Navigation links if useful

Log In

Sign Up

For authenticated pages, use an authenticated navigation/header that includes:

PrepBoard

Dashboard

Logout

Do not make the navbar visually heavy.

---

# 32. Responsive Design

Landing page, login page, signup page, and dashboard navigation must work on:

- desktop
- tablet
- mobile

Do not redesign the existing dashboard unnecessarily.

---

# 33. Do Not Break Existing Features

Before changing anything:

Read the existing:

- App.jsx
- relevant components
- backend routes
- Application model
- chatbot implementation
- existing API helpers
- CSS/Tailwind configuration
- CONTEXT.md
- ROADMAP.md

Understand the current architecture first.

Do not assume the application structure from this document is identical to the current codebase.

Adapt the implementation to the existing project.

---

# 34. Implementation Strategy

Do NOT implement everything blindly in one huge change.

First provide a concise implementation plan based on the actual codebase.

Then implement in logical milestones:

Milestone 1:
Backend User model + authentication APIs + middleware.

Milestone 2:
Associate Applications with authenticated users and protect application APIs.

Milestone 3:
Update chatbot operations to use authenticated user identity.

Milestone 4:
React Router + authentication state + ProtectedRoute.

Milestone 5:
Landing, Login, and Signup pages.

Milestone 6:
Logout + navigation + final UI consistency.

Milestone 7:
Migration support for existing application documents if necessary.

Milestone 8:
Verification and cleanup.

After each logical milestone, verify that the application still runs.

---

# 35. Do Not Add

Do NOT add:

- Google OAuth
- Redux
- Firebase Authentication
- Supabase Authentication
- Clerk
- Auth0
- NextAuth
- TypeScript migration
- Docker
- Microservices
- GraphQL
- unnecessary UI libraries
- unnecessary animation libraries

The existing stack should remain:

React
Vite
React Router
Express
MongoDB
Mongoose
Node.js

---

# 36. React Router Requirement

The routing configuration must be visible and understandable in App.jsx.

The final App.jsx should clearly communicate the application's route structure.

Conceptually:

<Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

    <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        }
    />
</Routes>

Adapt this to the existing codebase rather than blindly copying it.

---

# 37. Documentation

Update or create documentation explaining:

## Authentication flow

Signup:

React
↓
POST /api/auth/signup
↓
Express
↓
bcrypt
↓
MongoDB
↓
JWT httpOnly cookie
↓
Authenticated user

Login:

React
↓
POST /api/auth/login
↓
Express
↓
Verify bcrypt password
↓
JWT cookie
↓
Dashboard

Protected request:

React
↓
Cookie automatically sent
↓
authMiddleware
↓
req.user
↓
Application controller
↓
MongoDB query scoped to userId

---

# 38. Final Verification Checklist

Before considering the implementation complete, verify:

## Public access

- [ ] / loads landing page
- [ ] /login loads login page
- [ ] /signup loads signup page
- [ ] unauthenticated user cannot access /dashboard
- [ ] protected route redirects to /login

## Signup

- [ ] new user can register
- [ ] password is hashed
- [ ] duplicate email is rejected
- [ ] successful signup authenticates the user
- [ ] user reaches dashboard

## Login

- [ ] valid credentials work
- [ ] invalid credentials are rejected
- [ ] user reaches dashboard

## Session

- [ ] refreshing the dashboard keeps the user authenticated
- [ ] /api/auth/me works
- [ ] logout invalidates the session

## Application privacy

- [ ] user sees only their own applications
- [ ] user can create applications
- [ ] user can update their applications
- [ ] user can delete their applications
- [ ] user cannot access another user's application by changing the ID

## Chatbot

- [ ] chatbot creates applications for the authenticated user
- [ ] chatbot updates only the authenticated user's applications
- [ ] chatbot deletes only the authenticated user's applications
- [ ] chatbot cannot affect another user's applications

## UI

- [ ] landing page matches PrepBoard branding
- [ ] login page matches PrepBoard branding
- [ ] signup page matches PrepBoard branding
- [ ] monochrome/light-colour theme is preserved
- [ ] desktop layout works
- [ ] mobile layout works
- [ ] no unnecessary visual redesign of the existing dashboard

---

# 39. Final Instruction to the Agent

This is an existing working application.

Do not treat this as a greenfield project.

Preserve working functionality.

Before editing files, inspect the existing architecture and identify where authentication must integrate.

Do not replace working implementations merely because you prefer a different architecture.

Keep the implementation simple enough that a React-focused developer can understand the overall authentication flow.

Most importantly:

AUTHENTICATION MUST NEVER ALLOW ONE USER TO ACCESS ANOTHER USER'S APPLICATION DATA.

The visual design must remain consistent with PrepBoard's existing monochrome, light-colour, minimal, professional theme.
