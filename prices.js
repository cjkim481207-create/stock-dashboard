import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ET = { PRE_START: 240, REG_START: 570, REG_END: 960, AFT_END: 1200 };
const MAX_TICKERS = 60;          // 과도한 요청 방지
const TICKER_RE = /^[A-Z0-9.\-]{1,12}$/; // 안전한 티커만 허용

function getSessionET() {
  const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const min = et.getHours() * 60 + et.getMinutes();
  const dow = et.getDay();
  if (dow === 0 || dow === 6) return 'closed';
  if (min >= ET.REG_START && min < ET.REG_END) return 'regular';
  if (min >= ET.PRE_START && min < ET.REG_START) return 'pre';
  if (min >= ET.REG_END && min < ET.AFT_END) return 'after';
  return 'closed';
}

// 동시성 제한 — Yahoo rate-limit 회피 (한 번에 8개씩)
async function mapLimit(items, limit, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const settled = await Promise.all(batch.map(fn));
    results.push(...settled);
  }
  return results;
}

async function fetchYahoo(tickers) {
  const results = {};
  await mapLimit(tickers, 8, async (ticker) => {
    try {
      const q = await yf.quote(ticker, {}, { fetchOptions: { signal: AbortSignal.timeout(8000) } });
      if (!q || q.regularMarketPrice == null) { results[ticker] = null; return; }
      const price = q.regularMarketPrice;
      const prev = q.regularMarketPreviousClose ?? null;
      // change_pct 가 없으면 직접 계산
      let chg = q.regularMarketChangePercent;
      if (chg == null && prev) chg = ((price - prev) / prev) * 100;
      results[ticker] = {
        price,
        prev_close: prev,
        change_pct: chg ?? null,
        pre_market: q.preMarketPrice ?? null,
        pre_chg_pct: q.preMarketChangePercent ?? null,
        after_market: q.postMarketPrice ?? null,
        after_chg_pct: q.postMarketChangePercent ?? null,
        source: 'yahoo',
      };
    } catch {
      results[ticker] = null;
    }
  });
  return results;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { tickers } = req.query;
  if (!tickers || typeof tickers !== 'string') {
    return res.status(400).json({ error: 'no tickers' });
  }

  // 검증 + 중복 제거 + 상한
  const list = [...new Set(
    tickers.split(',').map((t) => t.trim().toUpperCase()).filter((t) => TICKER_RE.test(t))
  )].slice(0, MAX_TICKERS);

  if (!list.length) return res.status(400).json({ error: 'invalid tickers' });

  const session = getSessionET();
  let data;
  try {
    data = await fetchYahoo(list);
  } catch (e) {
    return res.status(502).json({ error: 'upstream failed', _session: session });
  }

  const cacheTime = session === 'closed' ? 60 : session === 'regular' ? 5 : 10;
  res.setHeader('Cache-Control', `s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`);

  return res.status(200).json({ ...data, _session: session, _source: 'yahoo', _ts: Date.now() });
}
