# Soppela Webpage

A simple React + Express application used to experiment with Vite and server side email sending.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development servers:
   ```bash
   npm run dev
   ```
   This runs the Express API and the Vite development server concurrently.

## Environment Variables

Set the following environment variables before running the server:

 - `JWT_SECRET` – secret key used to sign and verify JSON Web Tokens.
 - `EMAIL_USER` – email address used to send messages.
 - `EMAIL_PASS` – app password or SMTP password for the above account.

Optional:
- `NODE_ENV` – set to `production` to disable development middleware.

