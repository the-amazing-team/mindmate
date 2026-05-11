MindMate — Setup Guide
========================

This guide will help you get the MindMate project up and running on your local machine without errors.

1. Prerequisites
----------------
Ensure you have the following installed:
- Node.js (v18 or higher)
- Bun (Preferred) OR NPM

2. Install Dependencies
-----------------------
Open your terminal in the project root and run:

# Using Bun (Recommended)
bun install

# OR Using NPM
npm install

3. Environment Setup
--------------------
The project requires several environment variables.

1. Locate the .env.local file in the root directory.
2. If it doesn't exist, create it.
3. Ensure the following keys are set (refer to your Supabase and AI provider dashboards):

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_APP_ENV=development

4. Run Development Server
-------------------------
Start the development server with:

# Using Bun
bun run dev

# OR Using NPM
npm run dev

The app should now be running at http://localhost:3000 (or the port shown in your terminal).

5. Building for Production
--------------------------
To create a production build:
npm run build

To preview the production build:
npm run preview

Troubleshooting
---------------
- Module not found: Ensure you ran 'npm install' or 'bun install' successfully.
- Supabase Errors: Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct.
- Port Conflict: Check the terminal output for the correct URL if port 3000 is busy.
