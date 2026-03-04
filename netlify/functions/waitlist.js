const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!apiKey) {
    return json(500, { message: "Server is missing RESEND_API_KEY." });
  }

  if (!from) {
    return json(500, { message: "Server is missing RESEND_FROM." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_) {
    return json(400, { message: "Invalid request body." });
  }

  const email = (payload.email || "").trim();
  if (!EMAIL_REGEX.test(email)) {
    return json(400, { message: "Please enter a valid email address." });
  }

  const safeEmail = escapeHtml(email);

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: replyTo || undefined,
        subject: "Welcome to Purr Coding Waitlist",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2a3a;">
            <h2 style="margin-bottom: 8px;">You're in. Welcome to Purr Coding!</h2>
            <p style="margin-top: 0;">Hi ${safeEmail}, thanks for joining the waitlist.</p>
            <p>Our launch is set for <strong>April 1, 2026</strong>. We'll send updates as we get closer.</p>
            <p>Stay pawsitive,<br />The Purr Coding Team</p>
          </div>
        `,
      }),
    });

    const resendJson = await resendResponse.json();
    if (!resendResponse.ok) {
      const message =
        resendJson && resendJson.message
          ? resendJson.message
          : "Resend request failed.";
      return json(502, { message });
    }

    return json(200, {
      message: "You are on the waitlist. Welcome to Purr Coding!",
      id: resendJson.id,
    });
  } catch (_) {
    return json(500, { message: "Failed to send welcome email. Please try again." });
  }
};
