#!/bin/bash
set -e

if [ ! -f "admin/AdminDashboard.jsx" ]; then
  echo "Could not find admin/AdminDashboard.jsx. Run this script from your project's src folder."
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
path = Path("admin/AdminDashboard.jsx")
source = path.read_text()
line = 'import "./KitabiKeedaAdminTheme.css";'
if line in source:
    print("KitabiKeeda admin theme is already imported.")
else:
    path.write_text(line + "\n" + source)
    print("Added KitabiKeeda admin theme import to admin/AdminDashboard.jsx.")
PY
