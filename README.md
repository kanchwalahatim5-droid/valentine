# Valentine Proposal Site

A small single-page romantic proposal that playfully prevents choosing "No" — the No button dodges the cursor so the only real choice is Yes.

Files:
- index.html
- styles.css
- script.js

Preview locally
1. Put the three files in one folder.
2. From that folder run a simple static server:

- With Python 3:
```bash
python -m http.server 8000
```
Open http://localhost:8000 in your browser.

Deploy to GitHub Pages
1. Create a new repository on GitHub (example: `valentine-proposal`).
2. Initialize git locally and push:
```bash
git init
git add .
git commit -m "Initial valentine proposal site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```
3. In the repo → Settings → Pages (or Code and automation → Pages), set Source to `main` / `/ (root)` and save.
4. Wait a few minutes; your site will be available at:
   - https://<your-username>.github.io/<repo>/
   - If your repo is named `<your-username>.github.io`, it will be at https://<your-username>.github.io/

Customization ideas
- Replace text and colors in `index.html` and `styles.css`.
- Add images (e.g., a photo) by placing them in an `images/` folder and updating the markup.
- Add sound by playing a short tune on Yes click (respect autoplay/browser restrictions).

Need help?
- I can push these files to a GitHub repo for you (tell me repo name and visibility).
- Or I can add a custom message, animation tweaks, or a form to collect a reply.
