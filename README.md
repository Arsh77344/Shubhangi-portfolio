# Shubhangi Gupta — portfolio website

A fast, single-page portfolio. The finished site is **`index.html`** (one self-contained file, photos included). Everything needed to change it lives in **`src/`**.

```
index.html            ← the site (this is what gets published)
certificates/         ← the 9 certificate PDFs the site links to
src/
  body.html           ← page structure and most of the text
  style.css           ← all styling
  app.js              ← animations and interactions
  pages.py            ← the detail pages: roles, MSc, Infosys, Robin Hood Army, side projects
  journal.py          ← the three Journal articles
  certs.py            ← the certifications archive: every certificate, its group and its PDF
  images/             ← photos (.webp)  ·  images/originals/ = untouched background art
  data/land-110m.json ← map data for the globe
build.py              ← builds index.html from /src
tools/bake_backgrounds.py  ← only needed if you change the two background artworks
.nojekyll
.github/workflows/rebuild.yml  ← optional: rebuilds index.html for you on every push
```

## Publish on GitHub Pages (about 5 minutes)

1. Create a new repository on GitHub (e.g. `portfolio`), public.
2. Upload everything in this folder (drag the files into the repo page, or use git:
   `git init && git add . && git commit -m "First version" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`).
3. In the repo go to **Settings → Pages**. Under **Build and deployment** choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**. (This step can only be done by the repository owner — it cannot be switched on from a script or a workflow.)
4. After a minute the site is live at `https://<username>.github.io/<repo>/`.
5. Optional custom domain: in the same Pages screen add your domain under **Custom domain**, then add the DNS records GitHub shows you.

Name the repo `<username>.github.io` if you want the site at the bare address `https://<username>.github.io/`.

## Make changes

Edit the files in `src/`, then rebuild:

```
python3 build.py        # Python 3 only, nothing to install
```

Commit and push. (If you kept `.github/workflows/rebuild.yml`, GitHub rebuilds `index.html` for you when you push changes in `src/`, so you can even edit straight on github.com.)

| To change… | Edit |
|---|---|
| Headline, About text, "How I work", numbers, skills, contact | `src/body.html` (search for the words you see on the page) |
| Certifications: adding one, its group, dates or key points | `src/certs.py` (one line per certificate). Put new PDFs in `certificates/` and name the file in that line |
| The menu on phones and tablets | `src/body.html`, search `id="mnav"` |
| The folding-paper band ("A flat sheet…") | `src/body.html`, search `id="fold"`; the fold itself is in `src/app.js`, search `the fold:` |
| Role / education / volunteering detail pages | `src/pages.py` |
| Journal articles | `src/journal.py` (each article is marked as a draft; remove the label when approved) |
| Colours, fonts, spacing | `src/style.css` (the colours are variables at the top) |
| Photos | replace the file in `src/images/` with the same name (`.webp`), keep the proportions |

Tips: keep photos under about 300 KB each (convert to WebP). Email and LinkedIn links are in the footer and contact section of `src/body.html`.

## Still to confirm before announcing the site

- About paragraph, "How I work" and the headline are first drafts, so Shubhangi should replace them with her own words.
- The "What I learnt" points on each certificate are general topic descriptions, not copied from the certificates. Please check them.
- The three Journal articles are drafts.
- Rights to the Leeds arcade photo, the Renaissance artwork and the columns photo.
- Consent for the children's feeding photo, and OK for the client names on the Infosys page.
- Optional: add the CV as `CV.pdf` and point the "CV request" link at it. A sharper original of the mountain photo would improve the hero on large screens.

## Good to know

- The site loads its fonts (Google Fonts) and three small libraries (GSAP, Lenis, D3) from public CDNs, so visitors need an internet connection.
- Direct links such as `…/#journal` and `…/#journal-markets` open the Journal and a single article.
- On phones and tablets a menu button in the header opens the full section list; on wide screens the normal navigation shows instead.
- Long paragraphs collapse behind a **Read more** control on phones only, so the page stays short on a small screen.
- The certifications section is an index: on wide screens picking a row shows that certificate beside the list, and on small screens the row opens in place.


## Certificates and CV

- Certificate PDFs live in `certificates/`. On the live site, "Open the certificate" opens the PDF in a new tab. Certificates without a PDF are still listed, marked as not on file.
- The CV is `Shubhangi_Gupta_CV.pdf` in the root. The "Download my CV" buttons (contact section and footer) download it. To update the CV, replace that file (keep the same name) and, if you want the in-page preview refreshed, re-render `src/images/cv_page1.webp` and `cv_page2.webp`.
- Inside a preview frame where new tabs and downloads are blocked, the same links show an in-page preview instead.
