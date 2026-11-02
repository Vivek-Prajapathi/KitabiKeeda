# KitabiKeeda

KitabiKeeda is a responsive learning platform built with React. It includes a public website and course catalog, a separate LMS Marketplace, student learning pages, an instructor workspace, and administration tools. The frontend connects to the KitabiKeeda API through shared Axios services.

## Contents

- [Features](#features)
- [Separate course experiences](#separate-course-experiences)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available scripts](#available-scripts)
- [Routes and access](#routes-and-access)
- [Project structure](#project-structure)
- [API integration](#api-integration)
- [Design system](#design-system)
- [Deployment](#deployment)
- [AI-assisted development](#ai-assisted-development)
- [Known integration limitations](#known-integration-limitations)
- [Contributing](#contributing)

## Features

### Public website

- Homepage with featured courses loaded from the public course API.
- Responsive navigation, course discovery links, and account controls.
- Regular public course catalog with search and category filtering.
- Public course details with available pricing, curriculum, tags, and course information.
- Registration, login, account activation, and password recovery/reset pages.

### Student experience

- Protected student dashboard, profile, profile settings, and order history.
- My Learning areas for My Courses, Progress, Certificates, Purchases, and Wishlist.
- Course progress and purchase information are displayed when the API provides them.
- Existing certificate viewing and download operations.
- Wishlist viewing and supported add/remove actions.

### LMS Marketplace

- A dedicated LMS course catalog with API-backed search, categories, and course listings.
- LMS-specific course details and wishlist controls.
- My Learning, Instructor, and LMS Admin navigation links according to user permissions.
- Separate LMS layouts and routes; Marketplace pages do not render the public Courses page.

### Instructor workspace

Instructor and admin users can access the protected instructor workspace. It uses existing LMS API operations for supported workflows, including draft course creation and editing, lesson creation, course review submission, student enrollments, analytics, and revenue data.

### Administration

- Admin overview and existing management modules for users, regular courses, orders, coupons, notifications, analytics, and site content.
- LMS administration for available analytics, instructors, enrollments, CSV export, and category management.
- LMS course lifecycle management at `/admin/marketplace`.
- Existing admin routes remain protected by role-based authorization.

## Separate course experiences

The public catalog and the LMS Marketplace are different features and use different API services:

| Experience | Route | Data source | Course detail route |
|---|---|---|---|
| Public KitabiKeeda courses | `/courses` | `courseAPI` | `/courses/:id` |
| LMS Marketplace | `/marketplace` | `lmsAPI` | `/marketplace/:id` |

Use the **Courses** link in the public navigation for the regular catalog. Use **LMS Marketplace** to open the LMS catalog. LMS navigation returns to the main homepage through **Back to Site Home**.

## Technology

- React 19
- JavaScript (ES modules)
- Vite 8
- React Router 7
- Axios
- React Context API for authentication state
- Tailwind CSS 4 and project-specific CSS
- Lucide React icons
- Sonner notifications
- Recharts for existing analytics visualizations
- Oxlint

## Getting started

### Prerequisites

- Node.js `20.19+` or `22.12+`
- npm
- Access to a compatible KitabiKeeda backend API

### Install and run

1. Clone the repository and enter the project folder:

   ```bash
   git clone <repository-url>
   cd KitabiKeeda
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

4. Set `VITE_API_BASE_URL` in `.env` to the base URL of the backend API.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the URL printed by Vite (by default, `http://localhost:5173`).

Do not commit `.env` or other files containing secrets. Vite exposes `VITE_*` values to browser code, so these variables must not contain private credentials or tokens.

## Environment configuration

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Backend API base URL, including any API path prefix. If unset, the frontend uses `https://mockapi-mauve.vercel.app/api/v1`. |

Example:

```env
VITE_API_BASE_URL=https://your-api.example.com/api/v1
```

The backend must allow requests from the frontend origin and provide the endpoints expected by the API modules in `src/api/`.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the optimized production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for a preview. Run `npm run build` first. |
| `npm run lint` | Run Oxlint over the project. |

There is no test script configured in the current `package.json`.

## Routes and access

### Public website

| Route | Page |
|---|---|
| `/` | Main KitabiKeeda homepage |
| `/courses` | Regular public course catalog |
| `/courses/:id` | Regular public course details |
| `/login` | Login |
| `/register` | Registration |
| `/activate-account` | Account activation |
| `/forgot-password` | Password reset request |
| `/reset-password` and `/reset-password/:token` | Password reset |

### Student routes

These pages require an authenticated user:

| Route | Page |
|---|---|
| `/dashboard` | Student overview |
| `/dashboard/profile` | Profile |
| `/dashboard/profile/settings` | Profile settings |
| `/dashboard/profile/my-learning` | LMS My Learning |
| `/dashboard/orders` | Student order history |

My Learning tabs can be selected with the `tab` query parameter. Supported values include `courses`, `progress`, `certificates`, `purchases`, and `wishlist`.

### LMS and admin routes

| Route | Page | Access |
|---|---|---|
| `/marketplace` | LMS Marketplace | Public |
| `/marketplace/:id` | LMS course details | Public |
| `/instructor` | Instructor workspace | Instructor or admin |
| `/admin` | Admin overview | Admin |
| `/admin/analytics` | Admin analytics | Admin |
| `/admin/users` | User management | Admin |
| `/admin/courses` | Regular course management | Admin |
| `/admin/courses/create` | Create a regular course | Admin |
| `/admin/courses/edit/:id` | Edit a regular course | Admin |
| `/admin/marketplace` | LMS course lifecycle management | Admin |
| `/admin/lms-admin` | LMS administration | Admin |
| `/admin/coupons` | Coupon management | Admin |
| `/admin/orders` | Order management | Admin |
| `/admin/notifications` | Notifications | Admin |
| `/admin/layout` | Site content management | Admin |

Unauthenticated users are redirected to login when visiting protected routes. Users without the required role are redirected to the student dashboard.

## Project structure

```text
KitabiKeeda/
├── public/                    # Static files and public assets
├── src/
│   ├── admin/
│   │   └── pages/             # Admin overview and management pages
│   ├── api/                   # Axios API modules
│   ├── assets/                # Imported assets
│   ├── components/            # Shared UI, navigation, and route protection
│   ├── context/               # Authentication context
│   ├── hooks/                 # Shared React hooks
│   ├── layouts/               # Public, student, and admin layouts
│   ├── pages/                 # Public pages, Marketplace, and instructor workspace
│   ├── profile/               # Student profile, orders, and My Learning
│   ├── routes/                # React Router configuration
│   ├── styles/                # Additional styles
│   ├── App.jsx
│   ├── index.css              # Global design tokens and scoped page styles
│   └── main.jsx               # Application entry point
├── .env.example               # Environment variable template
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

### API modules

- `src/api/axios.js` creates the shared Axios client, sets the API base URL, attaches the stored access token, and handles the existing refresh-token flow.
- `src/api/auth.js` contains authentication operations.
- `src/api/course.js` contains regular public and admin course operations.
- `src/api/lms.js` contains LMS Marketplace, learning, instructor, and LMS admin operations.
- `src/api/admin.js`, `src/api/analytics.js`, and `src/api/notification.js` contain other platform services.

Keep network operations in these API modules and preserve the backend’s expected request and response structures when extending the app.

## API integration

The frontend communicates with the backend through `VITE_API_BASE_URL`. When it is not configured, the API client uses the default URL described in [Environment configuration](#environment-configuration).

The API service modules currently group operations for:

- Registration, account activation, login, logout, current-user lookup, profile updates, and password recovery.
- Public course listing/details and admin course management.
- LMS course catalog, categories, course details, search, wishlist, and payment-related API methods.
- Student learning, progress, purchases, orders, and certificates.
- Instructor course and lesson workflows, enrollments, analytics, and revenue.
- LMS admin analytics, course status, instructors, enrollments, exports, and categories.
- Admin users, orders, notifications, analytics, and site layout content.

This repository contains the frontend. Backend availability, account provisioning, email delivery, payment provider configuration, and production data are controlled by the configured API service.

## Design system

The interface uses KitabiKeeda’s existing purple/violet, navy, and neutral palette. Shared CSS variables are defined in `src/index.css` and reused by the public website and LMS.

- Primary violet: `#6d5ce7`
- Deep navy: `#172554`
- Light violet surface: `#eeeafe`
- Page background: `#f7f8fc`
- Main text: `#172033`
- Muted text: `#667085`
- Border: `#e5e7eb`

LMS styling is scoped to LMS classes to avoid changing unrelated public or admin styling.

## Deployment

Build the static site:

```bash
npm run build
```

The deployable output is written to `dist/`. Configure the hosting provider with `VITE_API_BASE_URL` and serve the frontend over HTTPS in production.

Because the application uses client-side routing, configure the static host to rewrite application routes to `index.html`. The backend must also allow the deployed frontend origin through its CORS policy.

The `VITE_API_BASE_URL` value is embedded in the frontend bundle during the build. Set the correct value in the deployment environment before building.

## AI-assisted development

AI development tools, including **Devin AI** and **GitHub Copilot**, were used to assist with parts of KitabiKeeda’s planning, implementation, and refinement. AI-generated suggestions and code were reviewed and integrated as part of the development process.

## Known integration limitations

- The current course details interface reports that checkout is unavailable; payment API methods alone do not configure a payment provider or complete the client checkout flow.
- Instructor course image upload and direct publishing are not exposed as supported instructor workflows in the current frontend/API integration. The instructor flow supports draft creation/editing, lesson creation, and submission for review.
- Some purchase/order amounts or statuses may not be returned by the backend. The UI should not infer or fabricate missing values.
- LMS analytics, course details, and administrative data depend on the configured backend and the permissions of the signed-in user.

## Contributing

1. Create a feature branch.
2. Keep changes scoped to the requested feature and follow the existing component, API, routing, and CSS conventions.
3. Preserve API contracts, authorization checks, and the separation between `/courses` and `/marketplace`.
4. Run the relevant checks before opening a pull request:

   ```bash
   npm run lint
   npm run build
   ```

5. In your pull request description, summarize behavior changes, note API dependencies, and include screenshots for visible UI changes where useful.
