export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed' }, 405, env);
    }

    if (!env.META_PIXEL_ID || !env.META_ACCESS_TOKEN) {
      return jsonResponse({ ok: false, error: 'Missing META_PIXEL_ID or META_ACCESS_TOKEN' }, 500, env);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400, env);
    }

    const eventName = String(body.event_name || '').trim();
    const standardEventName = String(body.standard_event_name || '').trim();
    const eventId = String(body.event_id || '').trim();
    const eventSourceUrl = String(body.event_source_url || '').trim();
    const eventTime = Number(body.event_time || Math.floor(Date.now() / 1000));
    const customData = isObject(body.custom_data) ? body.custom_data : {};

    if (!eventName || !eventId) {
      return jsonResponse({ ok: false, error: 'event_name and event_id are required' }, 400, env);
    }

    const clientIp = request.headers.get('cf-connecting-ip') || '';
    const clientUA = request.headers.get('user-agent') || '';
    const fbp = String(body.fbp || customData.fbp || '').trim();
    const fbc = String(body.fbc || customData.fbc || '').trim();

    const userData = {
      client_ip_address: clientIp,
      client_user_agent: clientUA
    };

    if (fbp) {
      userData.fbp = fbp;
    }
    if (fbc) {
      userData.fbc = fbc;
    }

    const payload = {
      data: [
        {
          event_name: standardEventName || eventName,
          event_time: Number.isFinite(eventTime) ? eventTime : Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url: eventSourceUrl,
          user_data: userData,
          custom_data: {
            source_event_name: eventName,
            ...customData
          }
        }
      ]
    };

    if (env.META_TEST_EVENT_CODE) {
      payload.test_event_code = env.META_TEST_EVENT_CODE;
    }

    const url = `https://graph.facebook.com/v22.0/${env.META_PIXEL_ID}/events?access_token=${env.META_ACCESS_TOKEN}`;

    let metaResponse;
    let metaJson;
    try {
      metaResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      metaJson = await metaResponse.json();
    } catch (error) {
      return jsonResponse({ ok: false, error: 'Meta API request failed', detail: String(error) }, 502, env);
    }

    if (!metaResponse.ok) {
      return jsonResponse({ ok: false, error: 'Meta API error', detail: metaJson }, 502, env);
    }

    return jsonResponse({ ok: true, event_id: eventId, forwarded_event: standardEventName || eventName, meta: metaJson }, 200, env);
  }
};

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(env),
      'Content-Type': 'application/json'
    }
  });
}