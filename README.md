# Musili Homes

Welcome to **Musili Homes** — a modern, luxury real estate platform for Kenya, built with React, TypeScript, Supabase, and Vite.

---

## ✨ Features
- Property listing, search, and filtering
- Agent and admin dashboards
- Task management for agents
- Secure authentication (Supabase)
- Image uploads and property galleries
- Responsive, luxury-inspired UI
- Role-based access (admin/agent)
- Real-time messaging (if enabled)

---

## 🚀 Getting Started (Local Development)

### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/musili-homes.git
cd musili-homes
```

### 2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 3. **Set Up Environment Variables**
- Copy the example file:
  ```bash
  cp .env.example .env
  ```
- Fill in your Supabase project credentials in `.env`:
  ```env
  VITE_SUPABASE_URL=your-supabase-url
  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```
- **Never commit your real `.env` file!**

### 4. **Run the App Locally**
```bash
npm run dev
# or
yarn dev
```
- Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Project Structure
```
├── src/
│   ├── components/      # UI and feature components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page-level components/routes
│   ├── services/        # API and database logic
│   ├── data/            # (Optional) Static/mock data
│   └── ...
├── public/              # Static assets
├── supabase/            # Supabase config & migrations
├── .env.example         # Example environment variables
├── .gitignore           # Files to ignore in git
├── package.json         # Project metadata & scripts
└── README.md            # This file
```

---

## 🌐 Deploying to Production

### **Recommended: Vercel (or Netlify, Render, Railway, etc.)**

#### **1. Push Your Code to GitHub**
- Make sure your latest code is committed and pushed.

#### **2. Create a Project on Vercel**
- Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
- Click **New Project** and import your repo.

#### **3. Set Environment Variables**
- In the Vercel dashboard, go to your project → **Settings** → **Environment Variables**.
- Add:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Use the same values as your local `.env` file.

#### **4. Deploy!**
- Click **Deploy**. Vercel will build and host your app.
- Your site will be live at `https://your-project-name.vercel.app` (or your custom domain).

#### **Other Hosts:**
- **Netlify:** Similar process; set env vars in Site Settings.
- **Render/Railway:** Add as a Node/React app, set env vars, deploy.

---

## 🧩 Supabase Setup (If Starting Fresh)
- [Create a Supabase project](https://app.supabase.com/)
- Get your project URL and anon key from Project Settings → API.
- Run SQL migrations in `supabase/migrations/` to set up tables and RLS policies.
- Set up storage buckets if you use image uploads.

---

## 🐞 Troubleshooting
- **App won’t connect to Supabase?**
  - Double-check your `.env` values and that your Supabase project is running.
- **Build fails on deploy?**
  - Make sure all env vars are set in your host’s dashboard.
- **Images not uploading?**
  - Check Supabase storage bucket permissions and CORS settings.
- **Role-based access not working?**
  - Ensure your Supabase RLS policies are correct and your user roles are set.

---

## 🤝 Contributing
- Fork the repo, make your changes, and open a pull request!
- Please open issues for bugs or feature requests.

---

## 📄 License
MIT (or your chosen license)

---

**Happy coding and welcome to Musili Homes!**
