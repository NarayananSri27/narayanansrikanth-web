# Narayanan Srikanth — Personal Website

A minimal, typography-led personal website built for Narayanan Srikanth (Engineering at McGill University). Built with Next.js 14 (App Router), Tailwind CSS, Supabase Authentication (Google OAuth), Supabase PostgreSQL, and private storage.

Designed with inspiration from minimalist typography, generous whitespace, restrained neutral aesthetics, and personal corners of the internet.

---

## Features

- **Public Foundation:**
  - **Home (`/`):** Personal introduction, engineering focus at McGill, areas of curiosity, selected projects, and current goals.
  - **Links (`/links`):** Clean directory for GitHub, LinkedIn, Email, and academic links.
  - **Contact (`/contact`):** Simple direct correspondence layout with 1-click email copy.
- **Signed-in Member Area (Google OAuth):**
  - **Photos (`/photos`):** Private-feeling gallery with album filtering ("Montréal & Campus", "Aviation & Labs", "35mm Film Scans"), full lightbox viewer, and owner-only management.
  - **Research (`/research`):** Engineering research notebook covering quantitative risk, aerospace control theory, low-latency software, code snippets, and search.
- **Owner Administration (`/admin`):**
  - **Member Directory:** Real-time registry of signed-in visitors, emails, registration dates, and optional Instagram handles.
  - **Visitor Activity Tracking:** Verified logs of which authenticated members visited which routes (`/photos`, `/research`), avoiding duplicate client re-render events.
  - **Content Management & Aggregate Analytics:** Direct links to manage photos and research, with strict privacy boundaries separating GoatCounter analytics from member identities.
- **Instagram Handle Introduction Modal:**
  - An optional, elegant prompt shown once after first sign-in ("What's your Instagram? It's optional — it just helps me put a face to the name.").
  - Skips gracefully without blocking access to private areas.
- **Design & Performance:**
  - Smooth Light & Dark themes with zero flash of unstyled content (`next-themes`).
  - Strict Row Level Security (RLS) policies protecting database tables and private photos.
  - Full keyboard accessibility and mobile responsiveness.

---

## Project Structure

```
narayanansrikanth-web/
├── public/
│   └── images/
│       └── portrait-placeholder.svg   # Replaceable portrait image
├── src/
│   ├── app/
│   │   ├── admin/page.tsx             # Owner-only Admin Dashboard
│   │   ├── api/activity/route.ts      # Authenticated visit logger API
│   │   ├── auth/callback/route.ts     # Supabase Google OAuth callback
│   │   ├── contact/page.tsx           # Contact & correspondence
│   │   ├── links/page.tsx             # Links directory
│   │   ├── photos/page.tsx            # Authenticated Photo Gallery
│   │   ├── research/page.tsx          # Authenticated Research Notebook
│   │   ├── globals.css                # Typography & theme design tokens
│   │   ├── layout.tsx                 # Root layout, Navbar & Footer
│   │   └── page.tsx                   # Public Homepage
│   ├── components/
│   │   ├── ActivityTracker.tsx        # Debounced route visitor tracking
│   │   ├── AuthProvider.tsx           # Session management & dev sandbox
│   │   ├── Footer.tsx                 # Minimal footer with dev controls
│   │   ├── InstagramModal.tsx         # Optional Instagram prompt
│   │   ├── Navbar.tsx                 # Navigation with lock indicators
│   │   ├── ThemeProvider.tsx          # Light / Dark theme context
│   │   └── ThemeToggle.tsx            # Accessible theme switch button
│   ├── data/
│   │   └── content.ts                 # Centralized content file for easy editing
│   └── lib/
│       └── supabase/
│           └── client.ts              # Resilient browser Supabase client
├── supabase/
│   └── schema.sql                     # Complete PostgreSQL schema & RLS policies
├── .env.example                       # Safe environment variable template
├── .env.local                         # Local environment configuration
├── package.json
└── tailwind.config.ts
```

---

## Quickstart & Local Development

### 1. Run the local dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Built-in Sandbox Testing Mode

Before setting up your Supabase project or Google OAuth credentials, the application includes a **Sandbox Mode** shown in the bottom footer:
- Click **"Test Member"** to experience the site as a signed-in visitor (unlocks Photos, Research, and tests the Instagram prompt).
- Click **"Test Owner"** to test the Owner Admin Dashboard (`/admin`) and photo/research creation controls.
- Click **"Reset to Signed Out"** to test public restriction prompts.

---

## How to Edit Your Content

You do not need to hunt through code to update your information:

1. Open `src/data/content.ts`.
2. Edit:
   - Your name, university, department, and bio text.
   - Areas of focus (engineering interests & creative pursuits).
   - Currently exploring topics and reading lists.
   - Selected projects (title, description, tags, GitHub link).
   - Social links and contact email.
3. Save the file — Next.js will hot-reload your changes immediately.
4. To replace the portrait placeholder, place your picture in `public/images/avatar.jpg` and update `avatarUrl: "/images/avatar.jpg"` in `src/data/content.ts`.

---

## External Setup Guide (Supabase & Google OAuth)

### Step 1: Create a Supabase Project (Free Tier)
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Project Settings -> API**, copy:
   - **Project URL**
   - **anon / public key**
3. In **SQL Editor**, open the SQL editor, copy the contents of `supabase/schema.sql`, replace `narayanan.srikanth@example.com` with your actual Google email, and click **Run**.
4. In **Storage**, create a new bucket named `private-photos` and set it to **Private**.

### Step 2: Configure Google Cloud OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and configure the **OAuth consent screen** (User type: External). Add the basic `email` and `profile` scopes.
3. Under **Credentials**, click **Create Credentials -> OAuth client ID** (Application type: Web application).
4. Add Authorized Redirect URI:
   `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**.
6. In your Supabase Dashboard, go to **Authentication -> Providers -> Google**, enable it, and paste your Client ID and Client Secret.

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_OWNER_EMAIL=your-actual-email@gmail.com
```

---

## Deployment to Vercel & GitHub

1. Initialize a git repository and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete personal website foundation"
   ```
2. Push to your private or public GitHub repository.
3. Go to [vercel.com](https://vercel.com) and import your GitHub repository.
4. Under **Environment Variables** in Vercel, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_OWNER_EMAIL`
5. Click **Deploy**. Vercel will build and assign you an SSL-secured URL.
6. In Supabase Authentication URL Configuration, add your production Vercel URL (e.g. `https://your-site.vercel.app`) as an Authorized Redirect URL.

---

## Cost & Free-Tier Guarantees

- **Next.js on Vercel:** Free hobby tier (unlimited deployments, generous bandwidth).
- **Supabase:** Free tier (500MB PostgreSQL database, 50,000 monthly active users, 1GB file storage).
- **GoatCounter Analytics:** Free for non-commercial personal websites.
- **Estimated Monthly Cost:** **$0.00 / month**.
