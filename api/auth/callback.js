// Callback OAuth: scambia il code con un access token GitHub e lo passa
// alla finestra di Decap CMS via postMessage (protocollo standard Netlify/Decap CMS).
export default async function handler(req, res) {
  const { code, error, error_description: errorDescription } = req.query;

  if (error) {
    res.status(400).send(`Errore OAuth GitHub: ${error} — ${errorDescription || ""}`);
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_GITHUB_CLIENT_ID,
        client_secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (data.error) {
      res.status(400).send(`Errore nello scambio del token: ${data.error_description || data.error}`);
      return;
    }

    const message = `authorization:github:success:${JSON.stringify({
      token: data.access_token,
      provider: "github",
    })}`;

    const html = `<!doctype html>
<html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(${JSON.stringify(message)}, e.origin);
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
Autenticazione completata, puoi chiudere questa finestra.
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send(`Errore durante l'autenticazione: ${err.message}`);
  }
}
