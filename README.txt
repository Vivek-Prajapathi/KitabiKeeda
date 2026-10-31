KitabiKeeda Home Landing Page
=============================

Files in this package are intended for your existing React/Vite project:
  pages/Home.jsx
  pages/Home.css

Install steps:
1. Stop Vite if it is running (Ctrl+C).
2. Open Terminal in your project's src folder.
3. Extract the ZIP there:
     unzip -o ~/Downloads/kitabikeeda-home-landing.zip
4. Restart from the project root (the folder containing package.json):
     npm run dev

The Home component uses the existing ../api/lms.js getMyLearning() helper and existing routes:
  /courses
  /dashboard
  /login
  /courses/:id

It does not change App.jsx, Navbar.jsx, auth.js, axios.js, or any profile/admin files.
If getMyLearning returns no active courses for a logged-in user, clearly labelled preview cards are shown to demonstrate the UI.
