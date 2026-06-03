import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const SECTOR_ETFS = {
  Technology: 'XLK',
  Energy: 'XLE',
  Healthcare: 'XLV',
  Financials: 'XLF',
  'Consumer Disc': 'XLY',
  Industrials: 'XLI',
  Utilities: 'XLU',
  'Real Estate': 'XLRE',
  Materials: 'XLB',
};

async function fetchFearGreed() {
  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('fg http');
    const data = await res.json();
    const score = Math.round(data?.fear_and_greed?.score ?? 50);
    const label =
      score < 25 ? 'Extreme Fear' :
      score < 45 ? 'Fear' :
      score < 55 ? 'Neutral' :
      score < 75 ? 'Greed' : 'Extreme Greed';
    return { score, label };
  } catch {
    return { score: 50, label: 'Neutral' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const allSymbols = [
      '^GSPC', '^IXIC', '^DJI', '^VIX',
      ...Object.values(SECTOR_ETFS),
      'BTC-USD', 'ETH-USD',
    ];

    // 지수/섹터/코인 + Fear&Greed 를 병렬로
    const [quotes, fearGreed] = await Promise.all([
      Promise.all(
        allSymbols.map((sym) =>
          yf.quote(sym, {}, { fetchOptions: { signal: AbortSignal.timeout(8000) } }).catch(() => null)
        )
      ),
      fetchFearGreed(),
    ]);

    const q = Object.fromEntries(allSymbols.map((s, i) => [s, quotes[i]]));
    const idx = (sym) => {
      const r = q[sym];
      if (!r) return { value: null, change_pct: null };
      return { value: r.regularMarketPrice ?? null, change_pct: r.regularMarketChangePercent ?? null };
    };

    const sectors = {};
    Object.entries(SECTOR_ETFS).forEach(([name, sym]) => {
      sectors[name] = q[sym]?.regularMarketChangePercent ?? null;
    });

    const out = {
      indices: {
        SP500: idx('^GSPC'),
        NASDAQ: idx('^IXIC'),
        DOW: idx('^DJI'),
        VIX: idx('^VIX'),
      },
      sectors,
      fear_greed: fearGreed,
      crypto: {
        BTC: { price: q['BTC-USD']?.regularMarketPrice ?? null, change_pct: q['BTC-USD']?.regularMarketChangePercent ?? null },
        ETH: { price: q['ETH-USD']?.regularMarketPrice ?? null, change_pct: q['ETH-USD']?.regularMarketChangePercent ?? null },
      },
      _ts: Date.now(),
    };

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
