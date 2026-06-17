# PE Computers & Bookshop POS

A high-performance, single-screen Point of Sale (POS) and inventory control system specialized for PE Computers & Bookshop.

## 🚀 Easy Netlify Deployment

We have pre-configured a continuous deployment pipeline using Netlify's direct Git connection.

### Continuous Deployment via GitHub & Netlify (Recommended)

This is the absolute simplest way to run your point-of-sale. Netlify will automatically rebuild and publish your application every time you make changes to GitHub.

1. **Upload your code to a GitHub Repository**:
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

2. **Connect your Repository within Netlify**:
   - Go to your [Netlify Dashboard](https://app.netlify.com/).
   - Click **Add new site** -> **Import an existing project**.
   - Choose **GitHub** and authorize access.
   - Select your POS repository.
   - Netlify will automatically detect the pre-configured `netlify.toml` file we loaded in this workspace.
   - Click **Deploy site**.

Done! Your point-of-sale application is now live on the internet, automatically updates, has 404 router redirects prepared, and is ready for PWA offline installer caching.

