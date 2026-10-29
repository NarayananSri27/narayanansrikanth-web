# How to Edit and Run Your Website

Your site: https://narayanansrikanth-web.vercel.app
Your code: https://github.com/NarayananSri27/narayanansrikanth-web
Your project folder: C:\Users\naray\.gemini\antigravity\scratch\narayanansrikanth-web

Always run commands from inside the project folder:

    cd C:\Users\naray\.gemini\antigravity\scratch\narayanansrikanth-web

---

## 1. Preview the site on your computer

    npm run dev

Open http://localhost:3000. It keeps running until you press Ctrl + C.
After saving a change, refresh with Ctrl + Shift + R.

## 2. Publish your changes to the live site

    git add .
    git commit -m "describe what you changed"
    git push

Vercel rebuilds automatically. Watch the Deployments tab on vercel.com until it says Ready.
Commit often. Each commit is a snapshot you can go back to.

## 3. Where things live

| What | File |
|---|---|
| Home page text and photo | src/app/page.tsx (photo file: public/img/Narayanan_F1.jpeg) |
| Links page | src/data/content.ts (the "links" list) |
| Contact page | src/app/contact/page.tsx |
| Privacy policy | src/app/privacy/page.tsx |
| Header | src/components/Navbar.tsx |
| Footer | src/components/Footer.tsx |
| All colors, sizes, spacing | src/app/globals.css |
| Light/dark default | src/app/layout.tsx (defaultTheme="light") |
| Pics and research content | Added from the live site while signed in as owner (stored in Supabase) |

## 4. Change a size or spacing (one number each)

These settings sit near the bottom of globals.css. Change one with a command like this
(swap the name and the number):

    (Get-Content src\app\globals.css) -replace '--nav-size: \d+px','--nav-size: 20px' | Set-Content src\app\globals.css

| Setting | Controls |
|---|---|
| --nav-size | Header link text size |
| --title-size | Your name in the header |
| --toggle-w, --toggle-h, --toggle-speed | Light/dark switch width, height, speed |
| --text-top | How far down "hey there" starts |
| --h1-size, --h1-gap | "hey there" size and the space under it |
| --body-size, --line-height, --para-gap | Paragraph text size, line spacing, space between paragraphs |
| --footer-size, --footer-pad, --footer-top | Footer text size, height, gap above |

Note: these commands change the setting everywhere it appears, including the PHONE LAYOUT
block at the end of globals.css. To change phone sizes only, edit the numbers inside that block.

## 5. Change a sentence

Edit the words inside the <p> ... </p> tags in src/app/page.tsx and save.
Type an apostrophe as &apos; and an ampersand as &amp;.
Check that it saved:

    findstr /n "some words from your sentence" src\app\page.tsx

## 6. Your services

| Service | What it does | Where |
|---|---|---|
| Vercel | Hosts the live site | vercel.com |
| GitHub | Stores your code | github.com/NarayananSri27/narayanansrikanth-web |
| Supabase | Sign-in, members, photos, research notes, visit log | supabase.com |
| Google Cloud | Google sign-in credentials | console.cloud.google.com |
| GoatCounter | Visitor counts for everyone | narayanansrikanth.goatcounter.com |

Never share or commit: the Supabase service_role key, the Supabase database password,
or the Google client secret. Your .env.local file is not uploaded to GitHub on purpose.
If you move to a new computer, copy .env.local over by hand.

## 7. If something breaks

- Site will not compile: read the first red line in the terminal. If a file looks empty or
  garbled, restore it with: git checkout -- path\to\file
- A change does not show up: you may be looking at an old server. Press Ctrl + C, then run
  Remove-Item -Recurse -Force .next, then npm run dev. Refresh with Ctrl + Shift + R.
- Changes in the editor do not seem to save: check the file with findstr, and make sure you
  opened the folder above in your editor.
- Sign-in stops working: check that your Supabase project is not paused (supabase.com dashboard).
- Live site looks different from your computer: confirm the push finished and Vercel says Ready.
- You broke something and want the last good version: git log --oneline shows your snapshots.
