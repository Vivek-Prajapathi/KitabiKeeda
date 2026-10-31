# 📚 KitabiKeeda — Online Learning Management System

\<p align="center">
&#x20; \<strong>A modern, interactive Learning Management System (LMS) built with React.\</strong>
\</p>

\<p align="center">
&#x20; A platform designed to make online learning accessible through course discovery, user authentication, personalized dashboards, and administrative course management.
\</p>

---

## 🌐 Live Demo

**Live Website:** [https://kitabi-keeda-omega.vercel.app](https://kitabi-keeda-omega.vercel.app)

**GitHub Repository:** [https://github.com/Vivek-Prajapathi/KitabiKeeda](https://github.com/Vivek-Prajapathi/KitabiKeeda)

---

## 📖 About the Project

**KitabiKeeda** is a web-based Learning Management System (LMS) developed to provide users with an organized and user-friendly online learning experience.

The platform brings together course discovery, user account management, personalized learning dashboards, and administrative tools in one application.

It provides separate experiences for regular users and administrators, with protected routes and role-based access control.

The application also includes an LMS Marketplace where administrators can manage learning content and related features.

### 🎯 Project Objectives

- Build a responsive and user-friendly online learning platform.
- Provide secure user registration, login, and account activation.
- Allow users to explore and access available courses.
- Provide personalized dashboards and profile management.
- Implement role-based access for users and administrators.
- Create an administrative interface for managing platform activities.
- Integrate frontend components with backend APIs using Axios.

---

## ✨ Key Features

### 👤 User Features

- User registration and login.
- Account activation.
- Protected user routes.
- User dashboard.
- Course listing and course discovery.
- Course details pages.
- Search and filtering of courses.
- User profile management.
- Profile information updates.
- Password management.
- Profile picture updates.
- My Learning section.

### 🛡️ Admin Features

- Dedicated Admin Dashboard.
- Admin-specific protected routes.
- User management.
- View all registered users.
- Update user roles.
- Delete users.
- Admin analytics and overview.
- Admin notifications.
- Order management.
- LMS Marketplace management.
- Course management.
- LMS coupon management.

### 🛒 LMS Marketplace

- Dedicated LMS Marketplace interface.
- Course discovery and management.
- Category-based course organization.
- Published course listing.
- Coupon-related functionality.
- Separate public course browsing and admin marketplace views.

---

## 🧰 Technology Stack

### Frontend

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| HTML5             | Application structure             |
| CSS3              | Styling and responsive layouts    |
| JavaScript (ES6+) | Application logic                 |
| JSX               | Writing UI components             |
| React 19          | Frontend library                  |
| React Router DOM  | Client-side routing               |
| Context API       | Global authentication state       |
| Axios             | HTTP requests and API integration |
| Vite              | Development server and build tool |

### Styling

- CSS3
- CSS Modules
- Custom CSS components
- Responsive layouts

### API & Backend Integration

- REST API integration
- Axios instances
- Request and response interceptors
- Bearer token authentication
- JSON data handling
- MockAPI backend integration

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- npm
- Vercel

---

## 🗂️ Project Folder Structure

The following structure represents the main application source and configuration files.

```text
KitabiKeeda/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   │
│   ├── admin/
│   │   ├── AdminAnalytics.jsx
│   │   ├── AdminContent.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminHome.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── AdminLayout.module.css
│   │   ├── AdminNotifications.jsx
│   │   ├── AdminOrders.jsx
│   │   ├── GetAllUsers.jsx
│   │   ├── KitabiKeedaAdminTheme.css
│   │   ├── LMSAdminCoupons.jsx
│   │   ├── LMSAdminOverview.jsx
│   │   ├── ManageCourses.jsx
│   │   ├── SingleUser.jsx
│   │   └── _admin.module.css
│   │
│   ├── api/
│   │   ├── auth.js
│   │   ├── axios.js
│   │   ├── course.js
│   │   ├── lms.js
│   │   └── marketplace.js
│   │
│   ├── assets/
│   │   ├── hero.jpg
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── ApplyLmsCoupon.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── pages/
│   │   ├── ActivateAccount.jsx
│   │   ├── CourseDetails.css
│   │   ├── CourseDetails.jsx
│   │   ├── Courses.css
│   │   ├── Courses.jsx
│   │   ├── Dashboard.css
│   │   ├── Dashboard.jsx
│   │   ├── Home.css
│   │   ├── Home.jsx
│   │   ├── Instructor.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.css
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   └── RegularCourses.jsx
│   │
│   ├── profile/
│   │   ├── MyLearning.jsx
│   │   ├── ProfileContentIndex.jsx
│   │   ├── ProfileDashboard.jsx
│   │   ├── ProfileSettings.jsx
│   │   ├── ProfileSidebar.jsx
│   │   ├── UpdateProfileInfo.jsx
│   │   ├── UpdateProfilePassword.jsx
│   │   ├── UpdatedProfilePicture.jsx
│   │   └── _profile.module.css
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## 📂 Folder Responsibilities

| Folder        | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| `admin/`      | Admin dashboard, user management, analytics, orders, and LMS administration.      |
| `api/`        | API services, Axios instances, authentication requests, and marketplace requests. |
| `assets/`     | Images, icons, and static assets.                                                 |
| `components/` | Reusable UI components such as Navbar and ProtectedRoute.                         |
| `context/`    | Global application state using React Context API.                                 |
| `hooks/`      | Custom React hooks such as `useAuth`.                                             |
| `pages/`      | Main application pages, including Home, Login, Register, Courses, and Dashboard.  |
| `profile/`    | User profile, settings, learning history, and account update components.          |

---

## ⚙️ Application Architecture

KitabiKeeda follows a component-based React architecture.

### 1. Component-Based Architecture

The application is divided into reusable components, pages, layouts, and feature-specific folders.

This improves maintainability, readability, and code reusability.

### 2. Routing

React Router DOM is used for navigation between application pages.

The application includes routes for:

- Home
- Login and Registration
- Account Activation
- Courses
- Course Details
- User Dashboard
- Profile
- Admin Dashboard
- LMS Marketplace

### 3. Authentication and Authorization

The application uses React Context API to manage authentication-related state.

The authentication implementation includes:

- Login and registration.
- Account activation.
- Token-based authentication.
- Protected routes.
- Role-based route access.
- Logout functionality.

The `ProtectedRoute` component helps restrict access to pages based on authentication and authorization conditions.

### 4. API Integration with Axios

Axios is used to communicate with backend REST APIs.

The application separates API logic into dedicated files inside `src/api/`.

The Axios configuration supports:

- Reusable Axios instances.
- Centralized base URL configuration.
- JSON request headers.
- Request interceptors.
- Bearer token attachment.
- Response interceptors.
- Centralized API error logging.

---

## 🔐 Authentication Flow

The general authentication flow is:

```text
User
  |
  v
Register / Login
  |
  v
Backend API Request
  |
  v
Authentication Response
  |
  v
Token Handling
  |
  v
Auth Context Update
  |
  v
Protected Routes
  |
  v
User Dashboard
```

Administrators have access to dedicated administrative routes based on their assigned role.

---

## 🔌 API Integration

The frontend communicates with the backend using REST APIs.

The API services are organized into separate modules:

| File             | Responsibility                        |
| ---------------- | ------------------------------------- |
| `auth.js`        | Authentication-related API operations |
| `axios.js`       | Shared Axios configuration            |
| `course.js`      | Regular course API requests           |
| `lms.js`         | LMS-related API operations            |
| `marketplace.js` | LMS Marketplace API operations        |

### Example: Axios Instance

```javascript
import axios from "axios";

const courseAPI = axios.create({
    baseURL: "https://mockapi-mauve.vercel.app/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

export default courseAPI;
```

### Example: Fetching Courses

```javascript
const response = await courseAPI.get("/lms/courses");

const courseList = response.data?.courses || [];
```

The backend API provides course data that is displayed in the frontend.

---

## 💻 Installation and Setup

Follow these steps to run KitabiKeeda locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Vivek-Prajapathi/KitabiKeeda.git
```

### Step 2: Navigate to the Project

```bash
cd KitabiKeeda
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open in Browser

Visit:

```text
http://localhost:5173
```

---

## 🏗️ Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

The production-ready files are generated inside the `dist/` directory.

---

## 🚀 Deployment

KitabiKeeda is deployed using **Vercel**.

Deployment configuration:

| Setting          | Value           |
| ---------------- | --------------- |
| Platform         | Vercel          |
| Framework        | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |
| Root Directory   | `./`            |

### Deployment Steps

1. Push the project to GitHub.
2. Import the GitHub repository into Vercel.
3. Select Vite as the framework preset.
4. Configure the build command and output directory.
5. Click Deploy.
6. Vercel builds and hosts the application.

Future changes pushed to the connected GitHub branch can trigger automatic deployments.

**Live Application:** [Add your Vercel URL here]

---

## 📸 Screenshots

Screenshots of the application can be added here to demonstrate the user interface.

Suggested screenshots:

- Home Page
- Registration and Login
- Courses Page
- Course Details
- User Dashboard
- Profile Management
- Admin Dashboard
- LMS Marketplace

To add screenshots, create a folder named `screenshots/` and place your images inside it.

Example:

```markdown
## 📸 Screenshots

### Home Page
![Home Page](screenshots/home.jpg)

### Courses
![Courses Page](screenshots/courses.jpg)

### Course Details
![Course Details](screenshots/course-details.jpg)

### Login
![Login](screenshots/login.jpg)

### Register
![Register](screenshots/Register.jpg)

### User Dashboard
![User Dashboard](screenshots/dashboard.jpg)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.jpg)

### LMS Marketplace
![LMS Marketplace](screenshots/marketplace.jpg)
```

---

## 🧠 Concepts and Skills Demonstrated

This project demonstrates practical implementation of:

- React component architecture.
- Functional components and React Hooks.
- React Router DOM.
- Context API for global state management.
- Custom Hooks.
- Authentication and Authorization.
- Protected Routes.
- Role-Based Access Control.
- REST API integration.
- Axios instances and interceptors.
- CRUD operations.
- Reusable components.
- CSS Modules and responsive styling.
- Git and GitHub version control.
- Vite production builds.
- Vercel deployment.

---

## 👩‍💻 Developer

**Vivek Prajapathi**

GitHub: [https://github.com/Vivek-Prajapathi](https://github.com/Vivek-Prajapathi)

Project: KitabiKeeda — Learning Management System

---

## 📄 License

This project is currently available as a public GitHub repository. A formal open-source license can be added if the project is intended for reuse or redistribution.

---

\<p align="center">
&#x20; \<strong>KitabiKeeda — Learn, Explore, and Grow. 📚\</strong>
\</p>
