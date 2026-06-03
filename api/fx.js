import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    // Yahoo Finance KRW=X: 달러/원 환율 실시간
    const q = await yf.quote('KRW=X');
    const rate = q.regularMarketPrice;
    const prev = q.regularMarketPreviousClose;
    const chg  = q.regularMarketChangePercent ?? ((rate - prev) / prev * 100);
    const high = q.regularMarketDayHigh;
    const low  = q.regularMarketDayLow;

    return res.status(200).json({
      rate: Number(rate.toFixed(2)),
      chg:  Number(chg.toFixed(4)),
      high, low,
      source: 'yahoo'
    });
  } catch (e) {
    // fallback: exchangerate-api (무료, CORS 없음)
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: AbortSignal.timeout(5000)
      });
      const d = await r.json();
      const rate = d?.rates?.KRW;
      if (rate) return res.status(200).json({
        rate: Number(rate.toFixed(2)),
        chg: 0,
        source: 'er-api'
      });
    } catch {}

    return res.status(200).json({ rate: 1350, chg: 0, source: 'fallback' });
  }
}
