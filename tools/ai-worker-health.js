export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (request.method === "GET" && path === "/") {
        return jsonResponse({
          ok: true,
          app: "Prime Detail IA Worker Assistant",
          message: "Bonsoir. Que faisons-nous aujourd'hui ?",
          options: assistantOptions(),
          usage: {
            health: "GET /health",
            domain: "GET /checks/domain?name=example.com",
            worker: "GET /checks/worker",
            assistant: "POST /assistant { \"message\": \"...\" }"
          }
        });
      }

      if (request.method === "GET" && path === "/health") {
        const report = await buildHealthReport(env, request);
        const status = report.ok ? 200 : 503;
        return jsonResponse(report, status);
      }

      if (request.method === "GET" && path === "/status") {
        const report = await buildHealthReport(env, request);
        return htmlResponse(renderStatusPage(report), report.ok ? 200 : 503);
      }

      if (request.method === "GET" && path === "/checks/domain") {
        const domain = (url.searchParams.get("name") || "").trim().toLowerCase();
        if (!domain) {
          return jsonResponse({ ok: false, error: "Parametre manquant: name" }, 400);
        }

        const result = await checkDomainDNS(domain);
        return jsonResponse(result, result.ok ? 200 : 502);
      }

      if (request.method === "GET" && path === "/checks/worker") {
        const result = await checkWorkerReachability(request);
        return jsonResponse(result, result.ok ? 200 : 502);
      }

      if (request.method === "POST" && path === "/assistant") {
        const body = await safeJson(request);
        const message = String((body && body.message) || "").trim();

        if (!message) {
          return jsonResponse({ ok: false, error: "Champ requis: message" }, 400);
        }

        const intent = detectIntent(message);
        const guidance = getGuidance(intent);

        return jsonResponse({
          ok: true,
          detected_intent: intent,
          answer: guidance,
          options: assistantOptions()
        });
      }

      return jsonResponse({ ok: false, error: "Route inconnue" }, 404);
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: "Erreur interne",
          details: String(error && error.message ? error.message : error)
        },
        500
      );
    }
  }
};

function assistantOptions() {
  return [
    {
      key: "transfer_domain",
      title: "Transferer un domaine",
      subtitle: "Guidez-moi tout au long du processus"
    },
    {
      key: "deploy_worker",
      title: "Deployer un travailleur",
      subtitle: "Aidez-moi a commencer"
    },
    {
      key: "domain_settings",
      title: "Parametres de domaine",
      subtitle: "Afficher ma configuration"
    },
    {
      key: "durable_objects",
      title: "Objets durables",
      subtitle: "Expliquer comment ils fonctionnent"
    },
    {
      key: "orange_vs_gray",
      title: "Nuage orange contre nuage gris",
      subtitle: "Quelle est la difference ?"
    }
  ];
}

async function buildHealthReport(env, request) {
  const checks = [];

  checks.push(bindingCheck("AI", env.AI));

  const selfUrl = getSelfUrl(request, env);
  checks.push({
    name: "self_url",
    ok: Boolean(selfUrl),
    detail: selfUrl || "SELF_URL non defini, utilisation automatique de l'URL courante"
  });

  const domainToCheck = String((env.DEFAULT_DOMAIN || "")).trim();
  if (domainToCheck) {
    const dnsResult = await checkDomainDNS(domainToCheck);
    checks.push({
      name: "default_domain_dns",
      ok: dnsResult.ok,
      detail: dnsResult
    });
  } else {
    checks.push({
      name: "default_domain_dns",
      ok: true,
      detail: "DEFAULT_DOMAIN non defini (optionnel)"
    });
  }

  const workerPing = await checkWorkerReachability(request);
  checks.push({
    name: "worker_reachability",
    ok: workerPing.ok,
    detail: workerPing
  });

  const ok = checks.every((c) => c.ok);

  return {
    ok,
    service: "ai-worker-health",
    timestamp: new Date().toISOString(),
    checks
  };
}

function bindingCheck(name, binding) {
  return {
    name: "binding_" + name.toLowerCase(),
    ok: Boolean(binding),
    detail: binding ? "binding present" : "binding manquant"
  };
}

async function checkDomainDNS(domain) {
  const endpoint = "https://cloudflare-dns.com/dns-query?name=" + encodeURIComponent(domain) + "&type=A";

  try {
    const response = await fetch(endpoint, {
      headers: {
        accept: "application/dns-json"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        domain,
        error: "Echec DNS over HTTPS",
        status: response.status
      };
    }

    const data = await response.json();
    const answers = Array.isArray(data.Answer) ? data.Answer : [];

    return {
      ok: answers.length > 0,
      domain,
      records_found: answers.length,
      records: answers.map((a) => ({ name: a.name, type: a.type, data: a.data, ttl: a.TTL }))
    };
  } catch (error) {
    return {
      ok: false,
      domain,
      error: "Erreur DNS",
      details: String(error && error.message ? error.message : error)
    };
  }
}

async function checkWorkerReachability(request) {
  const url = new URL(request.url);
  const pingUrl = new URL("/", url.origin).toString();

  try {
    const response = await fetch(pingUrl, {
      method: "GET",
      headers: {
        "x-health-probe": "1"
      }
    });

    return {
      ok: response.ok,
      status: response.status,
      endpoint: pingUrl
    };
  } catch (error) {
    return {
      ok: false,
      endpoint: pingUrl,
      error: "Auto-check inaccessible",
      details: String(error && error.message ? error.message : error)
    };
  }
}

function detectIntent(message) {
  const m = message.toLowerCase();

  if (m.includes("transfer") && m.includes("domaine")) {
    return "transfer_domain";
  }

  if (m.includes("deploy") || m.includes("deployer") || m.includes("worker") || m.includes("travailleur")) {
    return "deploy_worker";
  }

  if (m.includes("parametre") || m.includes("configuration") || m.includes("dns")) {
    return "domain_settings";
  }

  if (m.includes("durable") || m.includes("objet")) {
    return "durable_objects";
  }

  if (m.includes("orange") || m.includes("gris") || m.includes("proxy")) {
    return "orange_vs_gray";
  }

  return "general";
}

function getGuidance(intent) {
  if (intent === "transfer_domain") {
    return [
      "1) Debloquer le domaine chez l'ancien registrar (unlock + code EPP).",
      "2) Lancer le transfert dans Cloudflare Registrar.",
      "3) Verifier les NS et l'email de validation.",
      "4) Confirmer l'etat final dans Domain Registration."
    ];
  }

  if (intent === "deploy_worker") {
    return [
      "1) Installer Wrangler: npm i -g wrangler.",
      "2) Connexion: wrangler login.",
      "3) Deployer: wrangler deploy.",
      "4) Tester: GET /health puis GET /."
    ];
  }

  if (intent === "domain_settings") {
    return [
      "Verifier DNS records (A/AAAA/CNAME/TXT).",
      "Verifier SSL/TLS mode (Full strict recommande).",
      "Verifier regles cache et redirections.",
      "Verifier proxification (nuage orange/gris) selon le service."
    ];
  }

  if (intent === "durable_objects") {
    return [
      "Un Durable Object est un acteur avec etat persistant et adressage unique.",
      "Il est utile pour verrouillage, sessions, compteur, coordination temps reel.",
      "Chaque cle route vers une instance unique, ce qui simplifie la coherence."
    ];
  }

  if (intent === "orange_vs_gray") {
    return [
      "Nuage orange: trafic passe par Cloudflare (proxy, WAF, cache, masquage IP).",
      "Nuage gris: DNS only, trafic direct vers l'origine.",
      "Pour un site public, orange est generalement recommande."
    ];
  }

  return [
    "Je peux t'aider pour transfert domaine, deploiement Worker, DNS, Durable Objects et proxy orange/gris.",
    "Envoie une phrase simple et je te donne une procedure pas-a-pas."
  ];
}

function getSelfUrl(request, env) {
  const fromEnv = String((env.SELF_URL || "")).trim();
  if (fromEnv) {
    return fromEnv;
  }

  try {
    return new URL(request.url).origin;
  } catch (_error) {
    return "";
  }
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch (_error) {
    return null;
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStatusPage(report) {
  const badgeClass = report.ok ? "ok" : "ko";
  const badgeText = report.ok ? "Tout va bien" : "Attention";
  const checksHtml = report.checks
    .map((check) => {
      const rowClass = check.ok ? "ok" : "ko";
      const detail = escapeHtml(typeof check.detail === "string" ? check.detail : JSON.stringify(check.detail));
      return "<li class=\"row " + rowClass + "\">"
        + "<strong>" + escapeHtml(check.name) + "</strong>"
        + "<span class=\"state\">" + (check.ok ? "OK" : "KO") + "</span>"
        + "<pre>" + detail + "</pre>"
        + "</li>";
    })
    .join("");

  return "<!doctype html>"
    + "<html lang=\"fr\"><head><meta charset=\"utf-8\">"
    + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
    + "<title>Statut Worker</title>"
    + "<style>"
    + "body{font-family:Segoe UI,Arial,sans-serif;background:#f4f7fb;color:#10243e;margin:0;padding:24px;}"
    + ".card{max-width:900px;margin:0 auto;background:#fff;border-radius:14px;padding:20px;box-shadow:0 10px 30px rgba(16,36,62,.08);}"
    + ".top{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;}"
    + ".badge{padding:8px 12px;border-radius:999px;font-weight:700;}"
    + ".badge.ok{background:#ddf7e8;color:#10633b;}"
    + ".badge.ko{background:#ffe3e3;color:#8b1c1c;}"
    + ".meta{font-size:14px;color:#3f5775;}"
    + "ul{list-style:none;padding:0;margin:16px 0 0;}"
    + ".row{border:1px solid #dbe4ef;border-radius:10px;padding:12px 14px;margin-bottom:10px;background:#f9fbff;}"
    + ".row.ok{border-left:5px solid #1fa363;}"
    + ".row.ko{border-left:5px solid #d94a4a;}"
    + ".state{float:right;font-weight:700;}"
    + "pre{white-space:pre-wrap;word-break:break-word;margin:8px 0 0;font-size:12px;color:#2f4563;}"
    + "a{color:#1457c6;text-decoration:none;}"
    + "a:hover{text-decoration:underline;}"
    + "</style></head><body>"
    + "<section class=\"card\">"
    + "<div class=\"top\"><h1>Statut IA Worker</h1><span class=\"badge " + badgeClass + "\">" + badgeText + "</span></div>"
    + "<p class=\"meta\">Service: " + escapeHtml(report.service) + "</p>"
    + "<p class=\"meta\">Horodatage: " + escapeHtml(report.timestamp) + "</p>"
    + "<p class=\"meta\"><a href=\"/health\">Voir JSON brut</a> - Rafraichir la page pour mettre a jour.</p>"
    + "<ul>" + checksHtml + "</ul>"
    + "</section></body></html>";
}
