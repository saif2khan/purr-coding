# Purr Coding Landing Page

Static landing page with a waitlist form and a countdown timer to April 1, 2026.

## Waitlist welcome emails (Resend + Netlify)

The form submits to a Netlify Function at `/.netlify/functions/waitlist`.
That function sends the welcome email using Resend.

Set these environment variables in Netlify:

- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM`: Verified sender, for example `Purr Coding <hello@yourdomain.com>`
- `RESEND_REPLY_TO` (optional): Reply-to email address

Where to set:

1. Netlify dashboard -> Site configuration -> Environment variables
2. Add the variables above
3. Redeploy the site

## Local development

To test Netlify Functions locally, use Netlify CLI:

```bash
netlify dev
```

Then open the local URL shown by Netlify CLI.
