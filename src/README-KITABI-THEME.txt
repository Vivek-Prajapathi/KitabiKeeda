KITABIKEEDA MARKETPLACE + ADMIN THEME

Contents (paths are relative to src/):
- api/marketplace.js
- pages/Courses.jsx
- pages/Courses.css (updated to KitabiKeeda forest-green / cream colors)
- admin/KitabiKeedaAdminTheme.css (sidebar and admin-area overrides)
- apply-kitabi-theme.sh (adds one CSS import to the existing admin/AdminDashboard.jsx without replacing the component)

Install:
1. Open Terminal in your project's src folder.
2. Extract this ZIP into src, allowing replacement of the two marketplace files.
3. Run: bash apply-kitabi-theme.sh
4. From the project root, run: npm run dev

The script inserts an import into admin/AdminDashboard.jsx only if it is not already there. It does not replace the component or change auth files.
