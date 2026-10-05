import type { Request, Response } from 'express';

/**
 * Health check endpoint for serverless deployment
 * GET /api/health
 */
export default async function handler(req: Request | any, res?: Response | any) {
  const isKeyConfigured = Boolean(process.env.MAS_KEY_ID);

  const payload = {
    status: 'ok',
    service: 'singdeposit-mas-serverless-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    masKeyConfigured: isKeyConfigured,
    endpoints: {
      health: '/api/health',
      yearlyRates: '/api/fixedd',
    },
  };

  // Node.js / Express response object
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return res.status(200).json(payload);
  }

  // Web Request/Response standard (Edge / Fetch runtime)
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers,
  });
}
