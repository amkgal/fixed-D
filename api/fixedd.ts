import type { Request, Response } from 'express';

const MAS_YEARLY_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/interest_rates_of_banks_and_finance_companies_yearly';

/**
 * Serverless function to fetch MAS Interest Rates of Banks and Finance Companies (Yearly)
 * GET /api/fixedd
 *
 * Header required by MAS Gateway:
 * KeyId: <MAS_KEY_ID>
 */
export default async function handler(req: Request | any, res?: Response | any) {
  // CORS configuration
  const handleCorsHeaders = (targetRes: any) => {
    if (targetRes && typeof targetRes.setHeader === 'function') {
      targetRes.setHeader('Access-Control-Allow-Origin', '*');
      targetRes.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      targetRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, Authorization');
    }
  };

  const isExpress = Boolean(res && typeof res.status === 'function');
  if (isExpress) {
    handleCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  } else if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, KeyId, Authorization',
      },
    });
  }

  // 1. Resolve MAS_KEY_ID from environment variables (or optional request header)
  const masKeyId =
    process.env.MAS_KEY_ID ||
    (req.headers && (req.headers['keyid'] || req.headers['key-id'] || req.headers['x-mas-key-id']));

  if (!masKeyId) {
    const errorBody = {
      success: false,
      error: 'MAS_KEY_ID_NOT_CONFIGURED',
      message:
        'MAS_KEY_ID is missing. Please configure the MAS_KEY_ID environment variable in your deployment environment or .env file.',
      documentation:
        'MAS APIMG Gateway requires the header: KeyId: <MAS_KEY_ID>. See .env.example for details.',
      targetEndpoint: MAS_YEARLY_ENDPOINT,
    };

    if (isExpress) {
      return res.status(401).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // 2. Build target URL with forwarded query parameters if any (e.g. limit, sort, etc.)
    let targetUrl = MAS_YEARLY_ENDPOINT;
    const urlObj = new URL(targetUrl);

    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (value && typeof value === 'string') {
          urlObj.searchParams.set(key, value);
        }
      }
    } else if (req.url && req.url.includes('?')) {
      const incomingQuery = req.url.split('?')[1];
      const params = new URLSearchParams(incomingQuery);
      params.forEach((val, k) => urlObj.searchParams.set(k, val));
    }

    // 3. Make server-side request with required KeyId header
    const masResponse = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        KeyId: String(masKeyId).trim(),
        Accept: 'application/json',
        'User-Agent': 'SingDeposit-MAS-Gateway/1.0',
      },
    });

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      let parsedError: any;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { raw: errorText };
      }

      const status = masResponse.status;
      const errorPayload = {
        success: false,
        error: `MAS_GATEWAY_ERROR_HTTP_${status}`,
        message: `MAS API Gateway responded with status ${status}: ${masResponse.statusText}`,
        details: parsedError,
        endpoint: MAS_YEARLY_ENDPOINT,
      };

      if (isExpress) {
        return res.status(status).json(errorPayload);
      }
      return new Response(JSON.stringify(errorPayload), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await masResponse.json();

    // 4. Normalize records from MAS format for frontend convenience
    // MAS Table I.1 format typically contains results in data.result.records or data.records or data
    const rawList = data?.result?.records || data?.records || data?.data || (Array.isArray(data) ? data : []);

    const normalizedRecords = Array.isArray(rawList)
      ? rawList.map((row: any) => {
          const year = parseInt(row.end_of_year || row.year || row.period || '0', 10);
          return {
            year: isNaN(year) ? 0 : year,
            period: String(row.end_of_year || row.year || row.period || ''),
            bank_fixed_dep_1m: parseFloat(row.banks_fixed_deposits_1_mth ?? row.bank_fixed_dep_1m ?? '0'),
            bank_fixed_dep_3m: parseFloat(row.banks_fixed_deposits_3_mth ?? row.bank_fixed_dep_3m ?? '0'),
            bank_fixed_dep_6m: parseFloat(row.banks_fixed_deposits_6_mth ?? row.bank_fixed_dep_6m ?? '0'),
            bank_fixed_dep_12m: parseFloat(row.banks_fixed_deposits_12_mth ?? row.bank_fixed_dep_12m ?? '0'),
            bank_savings_dep: parseFloat(row.banks_savings_deposits ?? row.bank_savings_dep ?? '0'),
            bank_prime_lending: parseFloat(row.prime_lending_rate ?? row.bank_prime_lending ?? '0'),
            finance_fixed_dep_3m: parseFloat(row.fc_fixed_deposits_3_mth ?? row.finance_fixed_dep_3m ?? '0'),
            finance_fixed_dep_6m: parseFloat(row.fc_fixed_deposits_6_mth ?? row.finance_fixed_dep_6m ?? '0'),
            finance_fixed_dep_12m: parseFloat(row.fc_fixed_deposits_12_mth ?? row.finance_fixed_dep_12m ?? '0'),
            finance_savings_dep: parseFloat(row.fc_savings_deposits ?? row.finance_savings_dep ?? '0'),
          };
        })
      : [];

    const responsePayload = {
      success: true,
      source: 'Monetary Authority of Singapore (MAS) Gateway',
      table: 'Interest Rates of Banks and Finance Companies - Yearly',
      endpoint: MAS_YEARLY_ENDPOINT,
      count: normalizedRecords.length,
      records: normalizedRecords,
      raw: data,
    };

    if (isExpress) {
      return res.status(200).json(responsePayload);
    }
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    const errorBody = {
      success: false,
      error: 'SERVER_FETCH_EXCEPTION',
      message: error?.message || 'Failed to communicate with MAS gateway',
      endpoint: MAS_YEARLY_ENDPOINT,
    };

    if (isExpress) {
      return res.status(500).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
