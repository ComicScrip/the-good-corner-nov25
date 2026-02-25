# Getting Started

## Install dependencies

```
npm i
```

## Setup environment variables

```
cp .env.example .env
```

And then adjust variables in `.env` to match your local environment.

## Generate example data

```
npm run resetDB
```

## Start the server in dev mode

```
npm run dev
```

---

## OAuth Setup (GitHub and Google)

The app supports social login via GitHub and Google using [better-auth](https://better-auth.dev).
Both providers are **optional** — the app starts normally with empty credentials and simply
won't show the corresponding login button.

When you have credentials, add them to `backend/.env`:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

The sections below walk through creating those credentials.

---

### GitHub OAuth

#### 1. Open the OAuth Apps settings

Go to **GitHub → Settings → Developer settings → OAuth Apps**:

```
https://github.com/settings/developers
```

#### 2. Create a new OAuth App

Click **"New OAuth App"** and fill in the form:

| Field | Value |
|---|---|
| Application name | The Good Corner (dev) |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:4000/api/auth/callback/github` |

> The callback URL must match exactly — better-auth registers the route
> `GET /api/auth/callback/github` on the backend (port 4000).

Click **"Register application"**.

#### 3. Copy the credentials

On the app page you just created:

1. Copy the **Client ID** — paste it as `GITHUB_CLIENT_ID` in `.env`.
2. Click **"Generate a new client secret"**, copy it immediately (it is only shown once) —
   paste it as `GITHUB_CLIENT_SECRET` in `.env`.

#### 4. Verify

Restart the backend (`npm run dev`). You should see the "Continue with GitHub" button on
`/login` and `/signup`. Clicking it should redirect to GitHub's consent screen and, after
approval, land back on `http://localhost:3000/auth/callback`.

---

### Google OAuth

#### 1. Open the Google Cloud Console

```
https://console.cloud.google.com/
```

Create a new project (or select an existing one) using the project picker at the top of
the page.

#### 2. Enable the Google+ / People API

In the left sidebar go to **APIs & Services → Library**, search for
**"Google People API"** and click **Enable**. This is required for better-auth to read
the authenticated user's email and profile.

#### 3. Configure the OAuth consent screen

Go to **APIs & Services → OAuth consent screen**.

- Choose **External** (any Google account can log in during development).
- Fill in the required fields: app name, user support email, developer contact email.
- On the **Scopes** step, add `openid`, `email`, and `profile` — these are the only
  scopes better-auth needs.
- Add your own Google account as a **Test user** so you can log in during development
  before the app is verified by Google.
- Save and continue through the remaining steps.

#### 4. Create OAuth credentials

Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.

| Field | Value |
|---|---|
| Application type | Web application |
| Name | The Good Corner (dev) |
| Authorised JavaScript origins | `http://localhost:3000` |
| Authorised redirect URIs | `http://localhost:4000/api/auth/callback/google` |

Click **Create**.

#### 5. Copy the credentials

A dialog shows your **Client ID** and **Client secret**:

- Paste **Client ID** as `GOOGLE_CLIENT_ID` in `.env`.
- Paste **Client secret** as `GOOGLE_CLIENT_SECRET` in `.env`.

You can also download the JSON file and retrieve the values from it later.

#### 6. Verify

Restart the backend. The "Continue with Google" button should appear on `/login` and
`/signup`. Google's consent screen will warn that the app is "unverified" during
development — that is normal and expected. Click **"Continue"** to proceed.

---

### Callback URL reference

| Provider | Callback URL registered in the provider's console |
|---|---|
| GitHub | `http://localhost:4000/api/auth/callback/github` |
| Google | `http://localhost:4000/api/auth/callback/google` |

For production, replace `http://localhost:4000` with your actual backend domain and
register the production callback URLs in each provider's console alongside (not instead
of) the development ones.

---

## Email (Mailjet SMTP)

The app sends transactional emails (email verification on signup, password reset) via
**Nodemailer** using Mailjet's SMTP relay. All three variables are **optional** — the
app starts normally without them and simply skips sending emails (a warning is logged).

### Environment variables

Add to `backend/.env`:

```env
MAILJET_SMTP_USER=your-mailjet-api-key
MAILJET_SMTP_PASS=your-mailjet-secret-key
MAILJET_FROM_EMAIL=noreply@yourdomain.com
```

| Variable | Description |
|---|---|
| `MAILJET_SMTP_USER` | Your Mailjet **API Key** (used as SMTP username) |
| `MAILJET_SMTP_PASS` | Your Mailjet **Secret Key** (used as SMTP password) |
| `MAILJET_FROM_EMAIL` | The "From" address shown to recipients |

### How to get Mailjet SMTP credentials

#### 1. Create a Mailjet account

Go to [https://app.mailjet.com/signup](https://app.mailjet.com/signup) and register.
The free tier allows **200 emails/day** and **6 000/month** — plenty for development.

#### 2. Retrieve your API Key and Secret Key

After signing in, go to:

**Account → Master API Key & Sub API key management**

(Direct URL: `https://app.mailjet.com/account/apikeys`)

You will see your **API Key** and **Secret Key** on this page. Copy both values.

#### 3. Set the environment variables

```env
MAILJET_SMTP_USER=<your API Key>
MAILJET_SMTP_PASS=<your Secret Key>
MAILJET_FROM_EMAIL=noreply@yourdomain.com
```

> `MAILJET_FROM_EMAIL` can be any address, but Mailjet requires the sender domain to be
> verified for production use. For local development any address works on the free plan.

#### 4. SMTP connection details (already hardcoded in `mailer.ts`)

| Setting | Value |
|---|---|
| Host | `in-v3.mailjet.com` |
| Port | `587` |
| Encryption | STARTTLS (`requireTLS: true`) |
| Username | Your API Key |
| Password | Your Secret Key |

#### 5. Verify

Restart the backend and sign up with a new account. You should receive a verification
email within a few seconds.
