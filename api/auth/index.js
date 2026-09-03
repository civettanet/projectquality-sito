// Punto di ingresso del flusso OAuth per Decap CMS.
// Reindirizza l'utente alla pagina di autorizzazione di GitHub.
export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params.toString()}` });
  res.end();
}
