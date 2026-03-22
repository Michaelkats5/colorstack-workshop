# Google OAuth Setup Guide

Follow these steps to get your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## Step 1 — Create a Google Cloud project

1. Go to https://console.cloud.google.com/projectcreate
3. Click the project dropdown (top left) → **New Project**
4. Name it `colorstack-workshop` → click **Create**
5. Make sure the new project is selected in the dropdown

---

## Step 2 — Enable the OAuth API

1. In the left sidebar: **APIs & Services** → **Library**
2. Search for **"Google Identity"** → click it → click **Enable**

---

## Step 3 — Configure the OAuth consent screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** → click **Create**
3. Fill in the required fields:
   - App name: `ColorStack Workshop`
   - User support email: your email
   - Developer contact email: your email
4. Click **Save and Continue** through the scopes page (no changes needed)
5. On the **Test Users** page, add your own Google email address
6. Click **Save and Continue** → **Back to Dashboard**

> ⚠️ While in "Testing" mode, only users you add here can log in.  
> This is fine for the workshop — attendees don't need to be added.  
> To allow anyone, click **Publish App** (optional).

---

## Step 4 — Create OAuth credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `colorstack-workshop-local`
5. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   ```
   http://localhost:5000/auth/callback
   ```
6. Click **Create**

A dialog will show your **Client ID** and **Client Secret** — copy both.

---

## Step 5 — Add to your .env file

Open `backend/.env` and fill in:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/callback

FLASK_SECRET_KEY=pick-any-random-string-here
FLASK_ENV=development
```

> 🚨 Never commit your `.env` file. It's already in `.gitignore`.

---

## Verify it works

1. Start the backend: `python app.py`
2. Start the frontend: `npm start`
3. Open [http://localhost:3000](http://localhost:3000)
4. Click **Sign in with Google** — you should see the Google consent screen
5. After signing in, you should see your name and avatar in the dashboard header

---

## Common errors

| Error | Fix |
|---|---|
| `redirect_uri_mismatch` | The URI in Google Console must exactly match `GOOGLE_REDIRECT_URI` in `.env` |
| `access_blocked` | App is in Testing mode — add your email to Test Users |
| `invalid_client` | Double-check that Client ID and Secret are copied correctly with no spaces |
| Session not persisting | Make sure `FLASK_SECRET_KEY` is set in `.env` |
