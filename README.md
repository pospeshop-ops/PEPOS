# PE Computers & Bookshop POS

A high-performance, single-screen Point of Sale (POS) and inventory control system specialized for PE Computers & Bookshop.

## 🚀 Deployment Options

We have prepared pre-configured setup scripts for both **GitHub** and **Netlify** to make deployments and continuous integration direct and hassle-free.

---

### Option 1: Direct Netlify Continuous Git Connection (Recommended)

This is the absolute simplest way to deploy. Netlify will automatically detect updates whenever you push code changes to GitHub.

1. **Upload your code to GitHub**:
   - Create a new, blank repository on GitHub.
   - Initialize git locally:
     ```bash
     git init
     git add .
     git commit -m "Initialize Bookshop POS"
     git branch -M main
     git remote add origin YOUR_GITHUB_REPOSITORY_URL
     git push -u origin main
     ```

2. **Connect with Netlify**:
   - Go to your [Netlify Dashboard](https://app.netlify.com/).
   - Click **Add new site** -> **Import an existing project**.
   - Choose **GitHub** and authorize the access.
   - Select your POS repository.
   - Netlify will automatically read the `netlify.toml` file we configured in this project.
   - Click **Deploy site**.

Done! Your POS is now live and will auto-rebuild on any push to GitHub.

---

### Option 2: Automated Deployment via GitHub Actions (CI/CD)

If you'd like GitHub itself to run validation tests and compile the bundle before pushing to Netlify, we configured a GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. Go to your **Netlify User Settings** -> **Applications** -> **OAuth applications** -> **Personal access tokens** and create a token. This is your `NETLIFY_AUTH_TOKEN`.
2. Go to your active Netlify site's **Site settings** -> **Site details** and copy your **Site ID** (API ID). This is your `NETLIFY_SITE_ID`.
3. Go to your **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Add two new repository secrets:
   - `NETLIFY_AUTH_TOKEN` (The personal access token generated in step 1)
   - `NETLIFY_SITE_ID` (The API/Site ID copied in step 2)

As soon as these secrets are set, any push to the `main` branch will automatically launch a GitHub Action that builds, tests, and deploys your shop application!
