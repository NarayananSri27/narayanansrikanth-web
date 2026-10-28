# Quick Guide: How to Edit and Own Your Website

All your source code is located locally on your machine at:
`C:\Users\naray\.gemini\antigravity\scratch\narayanansrikanth-web`

---

## 1. How to Open the Code

### In Antigravity:
1. Click **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
2. Navigate to:
   `C:\Users\naray\.gemini\antigravity\scratch\narayanansrikanth-web`
3. Click **Select Folder**. The entire project tree will now appear in your sidebar.

### In Windows File Explorer:
1. Press `Win + R`, paste:
   ```
   C:\Users\naray\.gemini\antigravity\scratch\narayanansrikanth-web
   ```
   and press **Enter**.

---

## 2. Where to Make Changes

| What you want to change | File to edit |
|---|---|
| **Your Bio & Homepage Text** | `src/app/page.tsx` or `src/data/content.ts` |
| **Your Portrait Photo** | Replace `public/img/main.webp` with your own photo |
| **Links (`/links`)** | `src/data/content.ts` or `src/app/links/page.tsx` |
| **Contact Email & Notes** | `src/data/content.ts` or `src/app/contact/page.tsx` |
| **Colors, Fonts & Theme** | `src/app/globals.css` |
| **Navigation Bar Items** | `src/components/Navbar.tsx` |
| **Photo Gallery Images** | `src/app/photos/page.tsx` |
| **Research Notebook Notes** | `src/app/research/page.tsx` |
| **Owner Email Setting** | `.env.local` (`NEXT_PUBLIC_OWNER_EMAIL`) |

---

## 3. How to Run Locally While Editing

Whenever you want to make edits, open your terminal (in PowerShell or in Antigravity's integrated terminal) inside the project folder:

```powershell
cd C:\Users\naray\.gemini\antigravity\scratch\narayanansrikanth-web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
**Any time you save a file, the browser updates instantly (hot-reload).**

---

## 4. How to Replace Your Picture

1. Find any photo you like (e.g. `my-photo.jpg` or `portrait.png`).
2. Rename or copy it to:
   `public/img/main.webp` (or `public/img/portrait.jpg`)
3. If you use a `.jpg` or `.png` extension, simply change `<img src="/img/main.webp" ...>` to `<img src="/img/portrait.jpg" ...>` in `src/app/page.tsx`.

---

## 5. How to Save Your Work to GitHub

This folder is already an active Git repository!

```powershell
# 1. Check changed files
git status

# 2. Stage and commit your edits
git add .
git commit -m "update bio and add new projects"

# 3. Connect to your GitHub repository (run once after creating repo on GitHub)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

---

## 6. How to Deploy Online for Free (Vercel)

1. Push your repository to your GitHub account.
2. Sign in to [Vercel.com](https://vercel.com) (free).
3. Click **Add New...** > **Project** and select your GitHub repository.
4. Click **Deploy**. Vercel will give you a live HTTPS link (e.g. `narayanansrikanth.vercel.app`) that automatically updates every time you push code to GitHub.
