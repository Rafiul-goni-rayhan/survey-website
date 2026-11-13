# Survey Website — সম্পূর্ণ কোড ও Setup Guide

এটি একটি **একটি নির্দিষ্ট Survey** (১২টি fixed questions) ভিত্তিক Next.js project overlay।
কোনো AI Question Generator নেই। Admin Login, Public Survey, নিরাপদ Dashboard, CSV Export আছে।

## ১. Existing Project-এ ফাইল বসানো

তোমার `survey-website` Next.js project ইতিমধ্যে তৈরি আছে।

1. এই ZIP Extract করো।
2. ZIP-এর **src** folder Copy করে তোমার `survey-website` project folder-এ Paste করো।
3. Windows জিজ্ঞেস করলে existing files **Replace** করো। এটি `src/app/page.js`, `layout.js`, `globals.css` সহ সব প্রয়োজনীয় ফাইল বসাবে।
4. ZIP-এর `supabase` folder-টিও project root-এ Copy করো।
5. তোমার project-এর existing `package.json`, `package-lock.json`, `next.config.*` বদলানোর দরকার নেই।

## ২. Supabase JS package install

VS Code Terminal-এ project root থেকে:

```bash
npm install @supabase/supabase-js
```

## ৩. Supabase Project

1. https://supabase.com/dashboard এ গিয়ে account খুলে **New Project** তৈরি করো।
2. Project-এর **SQL Editor** থেকে `supabase/setup.sql`-এর সব কোড Copy-Paste করে **Run** করো।
3. Supabase Project Dashboard থেকে **Project URL** এবং **publishable key** (অথবা legacy anon key) সংগ্রহ করো।
4. project root-এ `.env.local` নামে নতুন ফাইল তৈরি করো। ZIP-এর `.env.local.example` থেকে format Copy করে আসল values বসাও:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
```

> **Secret/service_role key কখনো `.env.local`-এর NEXT_PUBLIC_ variable-এ বসাবে না।** Password-ও কোডে বসাবে না।

## ৪. Admin Account

1. Supabase Dashboard → **Authentication → Users**-এ যাও।
2. **Add User** → নতুন email/password দিয়ে Admin User তৈরি করো (নিয়মিত ইউজার নয়, তোমার নিজের Admin Account)।
3. সেই User-এর **User ID (UUID)** Copy করো।
4. **SQL Editor**-এ গিয়ে আলাদা করে এই query Run করো (নিজের UUID বসিয়ে):

```sql
insert into public.admin_users (user_id)
values ('PASTE-YOUR-ADMIN-USER-UUID-HERE');
```

এই ধাপটি অবশ্যই করতে হবে। শুধু Supabase Auth-এ account থাকলেই Admin data দেখা যাবে না।
Public sign-ups প্রয়োজন নেই; Authentication Settings-এ public sign-up disable করতে পারো।

## ৫. Local Website চালু

Project root-এ Terminal:

```bash
npm run dev
```

আগে `npm run dev` চালু থাকলে, `.env.local` দেওয়ার পর `Ctrl+C` দিয়ে বন্ধ করে আবার চালাও।

- Public Survey: http://localhost:3000
- Admin Login: http://localhost:3000/login
- Admin Dashboard: http://localhost:3000/dashboard

## ৬. Test

1. প্রথমে **পরীক্ষামূলক তথ্য দিয়ে** ১২টি প্রশ্ন পূরণ করো।
2. সব সঠিক থাকলে Submit-এর পরে "Thank You" আসবে।
3. Navbar-এর Admin Login থেকে Admin email/password দিয়ে Login করো।
4. Dashboard-এ নতুন Response দেখাবে।
5. "View"-এ সব ১২টি উত্তর দেখবে; "Download All CSV" করলে Excel-এ খোলা যায় এমন CSV Download হবে।
6. Login ছাড়া `/dashboard` খুললে `/login`-এ ফিরে যাবে এবং Database RLS response data পড়তে দেবে না।

## ৭. Online Website করতে চাইলে (পরে)

- Project GitHub-এ Push করে Vercel-এ import করবে।
- Vercel-এর Environment Variables-এ একই `NEXT_PUBLIC_SUPABASE_URL` এবং `NEXT_PUBLIC_SUPABASE_ANON_KEY` বসাবে।
- Deploy-এর পরে Public Website URL মানুষকে শেয়ার করতে পারবে।

## ফাইলগুলো

- `src/app/page.js`: ১২টি fixed-question Survey Form
- `src/app/components/Navbar.js`: Navbar, Admin Login / Dashboard / Logout
- `src/app/login/page.js`: Supabase Email+Password Admin Login
- `src/app/dashboard/page.js`: Protected Dashboard, Search, View All Data, CSV Export
- `src/app/data/questions.js`: ১২টি fixed question-এর তালিকা
- `src/app/lib/supabase.js`: Supabase public-client connection
- `src/app/layout.js`: সব page-এ Navbar
- `src/app/globals.css`: Tailwind + readable high-contrast text
- `supabase/setup.sql`: Database, Admin Role ও RLS protection

## গুরুত্বপূর্ণ নিরাপত্তা নোট

- Admin account ছাড়া কেউ survey responses `SELECT` করতে পারবে না (Database RLS)।
- Public response পাঠানোর endpoint anonymous submission সমর্থন করে; live site-এ abuse/spam প্রতিরোধে CAPTCHA বা rate limiting পরে লাগতে পারে।
- Name, email, phone ইত্যাদি personal data সংগ্রহ করলে উদ্দেশ্য/consent স্পষ্ট করে জানাও এবং প্রয়োজনমতো ডেটা রাখো।
- Admin password, service role key বা secret কখনো পাবলিক চ্যাটে বা GitHub-এ দিও না।
- `.env.local` local/private রাখবে।
