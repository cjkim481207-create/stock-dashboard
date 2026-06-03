import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ════════════════════════════════════════════════════════════════════
   STYLES — 라이트/다크 자동 대응, 세련된 글래스+뉴트럴 팔레트
   ════════════════════════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Roboto+Mono:wght@500;600&display=swap');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :root {
    --bg:#fafafb; --surface:#ffffff; --surface2:#f4f4f6; --surface3:#ebebef;
    --border:rgba(0,0,0,0.07); --border2:rgba(0,0,0,0.12);
    --text:#0d0d12; --muted:#76767e; --muted2:#a8a8b0;
    --up:#e0245e; --down:#2563eb; --green:#00b84d; --amber:#f59e0b; --purple:#8b5cf6;
    --accent:#2563eb; --accent-soft:rgba(37,99,235,0.1);
    --shadow-sm:0 1px 3px rgba(0,0,0,0.05);
    --shadow-md:0 4px 16px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 32px rgba(0,0,0,0.12);
    --sans:'Manrope',-apple-system,BlinkMacSystemFont,sans-serif;
    --mono:'Roboto Mono',ui-monospace,monospace;
    --radius:16px; --radius-sm:12px; --radius-lg:22px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg:#0a0a0c; --surface:#16161a; --surface2:#1e1e24; --surface3:#28282f;
      --border:rgba(255,255,255,0.08); --border2:rgba(255,255,255,0.14);
      --text:#f5f5f7; --muted:#8e8e98; --muted2:#5a5a62;
      --up:#ff4d6d; --down:#4d8bff; --accent:#4d8bff; --accent-soft:rgba(77,139,255,0.16);
      --shadow-sm:0 1px 3px rgba(0,0,0,0.4);
      --shadow-md:0 4px 16px rgba(0,0,0,0.5);
      --shadow-lg:0 8px 32px rgba(0,0,0,0.6);
    }
  }

  body { background:var(--bg); color:var(--text); font-family:var(--sans); -webkit-font-smoothing:antialiased; overscroll-behavior:none; }
  button { font-family:var(--sans); cursor:pointer; border:none; background:none; color:inherit; }
  input  { font-family:var(--sans); }
  .mono { font-family:var(--mono); font-variant-numeric:tabular-nums; }

  .app { max-width:460px; margin:0 auto; min-height:100vh; min-height:100dvh; display:flex; flex-direction:column; padding-bottom:96px; position:relative; }

  /* ── 하단 네비 ── */
  .nav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:460px; display:flex; background:color-mix(in srgb, var(--surface) 82%, transparent); backdrop-filter:blur(24px) saturate(180%); -webkit-backdrop-filter:blur(24px) saturate(180%); border-top:1px solid var(--border2); z-index:50; padding-bottom:env(safe-area-inset-bottom); }
  .nav-btn { flex:1; padding:12px 4px 10px; display:flex; flex-direction:column; align-items:center; gap:4px; color:var(--muted2); font-size:10px; font-weight:700; letter-spacing:0.02em; transition:color .2s, transform .15s; }
  .nav-btn.active { color:var(--accent); }
  .nav-btn:active { transform:scale(0.9); }
  .nav-btn svg { width:23px; height:23px; stroke-width:2.2; fill:none; stroke:currentColor; }

  /* ── 헤더 ── */
  .header { padding:20px 22px 0; display:flex; justify-content:space-between; align-items:flex-start; }
  .header-title { font-size:13px; font-weight:700; color:var(--muted); letter-spacing:0.04em; text-transform:uppercase; }
  .header-right { display:flex; align-items:center; gap:10px; }
  .currency-toggle { display:flex; background:var(--surface3); border-radius:20px; padding:3px; gap:2px; }
  .curr-btn { padding:6px 13px; border-radius:16px; font-size:13px; font-weight:800; color:var(--muted); transition:all .2s; }
  .curr-btn.active { background:var(--surface); color:var(--text); box-shadow:var(--shadow-sm); }
  .refresh-btn { width:34px; height:34px; border-radius:50%; background:var(--surface3); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:17px; transition:all .25s; }
  .refresh-btn:active { transform:rotate(180deg); background:var(--accent-soft); color:var(--accent); }
  .refresh-btn.spinning svg { animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .src-pill { font-size:10px; font-weight:700; color:var(--muted); display:flex; align-items:center; gap:4px; margin-top:5px; justify-content:flex-end; }
  .src-dot { width:6px; height:6px; border-radius:50%; }
  .src-dot.live { background:var(--green); box-shadow:0 0 0 3px color-mix(in srgb, var(--green) 25%, transparent); animation:livePulse 1.6s ease-in-out infinite; }
  .src-dot.poll { background:var(--amber); }
  .src-dot.off  { background:var(--muted2); }
  @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* ── 시장 상태 배너 ── */
  .market-banner { margin:14px 22px 0; border-radius:var(--radius); padding:13px 16px; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border); transition:background .4s; }
  .banner-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
  .banner-dot.open   { background:var(--green);  box-shadow:0 0 0 4px color-mix(in srgb, var(--green) 22%, transparent); animation:livePulse 2s ease-in-out infinite; }
  .banner-dot.pre    { background:var(--amber);  box-shadow:0 0 0 4px color-mix(in srgb, var(--amber) 22%, transparent); }
  .banner-dot.after  { background:var(--purple); box-shadow:0 0 0 4px color-mix(in srgb, var(--purple) 22%, transparent); }
  .banner-dot.closed { background:var(--muted2); }
  .banner-status { font-size:14px; font-weight:800; letter-spacing:-0.01em; }
  .banner-time   { font-size:11px; font-weight:500; color:var(--muted); margin-top:2px; }
  .banner-kr-time { font-size:13px; font-weight:800; }
  .banner-us-time { font-size:11px; color:var(--muted); font-weight:500; margin-top:1px; }

  /* ── 환율 카드 ── */
  .fx-card { margin:12px 22px 0; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:14px 18px; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm); }
  .fx-left { display:flex; align-items:center; gap:12px; }
  .fx-flag { font-size:22px; }
  .fx-label { font-size:11px; color:var(--muted); font-weight:700; margin-bottom:3px; letter-spacing:0.02em; }
  .fx-rate-big { font-size:21px; font-weight:800; letter-spacing:-0.02em; }
  .fx-right { text-align:right; }
  .fx-chg { font-size:14px; font-weight:800; }
  .fx-src { font-size:10px; color:var(--muted); font-weight:500; margin-top:4px; }

  /* ── 총 자산 ── */
  .total-block { padding:18px 22px 6px; }
  .total-value { font-size:42px; font-weight:800; letter-spacing:-0.045em; line-height:1.05; }
  .total-sub  { font-size:15px; font-weight:700; margin-top:8px; display:inline-flex; align-items:center; gap:6px; }
  .total-day  { font-size:13px; font-weight:600; margin-top:4px; }
  .pos { color:var(--up); } .neg { color:var(--down); } .neu { color:var(--muted); }
  .pnl-pill { padding:2px 8px; border-radius:8px; font-size:13px; font-weight:800; }
  .pnl-pill.pos { background:color-mix(in srgb, var(--up) 14%, transparent); }
  .pnl-pill.neg { background:color-mix(in srgb, var(--down) 14%, transparent); }

  .sync-row { padding:8px 22px 0; display:flex; align-items:center; gap:6px; font-size:11px; color:var(--muted); font-weight:600; }
  .sync-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  /* ── 서브탭 ── */
  .sub-tabs { display:flex; padding:16px 22px 0; gap:6px; }
  .sub-tab { flex:1; padding:9px 0; font-size:13px; font-weight:700; color:var(--muted); background:var(--surface2); border-radius:11px; text-align:center; transition:all .2s; }
  .sub-tab.active { color:var(--surface); background:var(--text); }

  .sort-bar { display:flex; justify-content:space-between; align-items:center; padding:16px 22px 8px; }
  .sort-label { font-size:14px; font-weight:800; letter-spacing:-0.01em; }

  /* ── 종목 카드 ── */
  .list { padding:0 14px; display:flex; flex-direction:column; }
  .card { display:flex; align-items:center; gap:14px; padding:14px; border-radius:var(--radius); cursor:pointer; transition:background .2s, transform .12s; }
  .card:active { transform:scale(0.985); background:var(--surface2); }
  .card-logo { width:44px; height:44px; border-radius:14px; background:var(--surface3); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; border:1px solid var(--border); }
  .card-logo img { width:100%; height:100%; object-fit:contain; }
  .card-logo-fb { font-size:14px; font-weight:800; color:white; }
  .card-mid { flex:1; min-width:0; }
  .card-ticker { font-size:16px; font-weight:800; letter-spacing:-0.02em; }
  .card-shares { font-size:12px; color:var(--muted); font-weight:500; margin-top:3px; }
  .card-right { text-align:right; }
  .card-cur { font-size:12px; color:var(--muted); font-weight:600; margin-bottom:2px; }
  .card-value { font-size:16px; font-weight:800; letter-spacing:-0.02em; }
  .card-pnl { font-size:12px; font-weight:700; margin-top:3px; }
  .card-daychg { font-size:11px; font-weight:600; margin-top:2px; }
  .ext-badge { display:inline-block; font-size:10px; font-weight:700; padding:2px 7px; border-radius:6px; margin-top:3px; }
  .ext-pre   { background:color-mix(in srgb, var(--amber) 14%, transparent); color:var(--amber); }
  .ext-after { background:color-mix(in srgb, var(--purple) 14%, transparent); color:var(--purple); }

  /* ── 수익 뷰 ── */
  .profit-row { padding:14px; border-radius:var(--radius); }
  .bar-bg { height:7px; background:var(--surface3); border-radius:4px; overflow:hidden; }
  .bar-fg { height:100%; border-radius:4px; transition:width .6s cubic-bezier(.2,.8,.2,1); }

  /* ── 파이차트 섹션 ── */
  .pie-section { padding:18px 22px; }

  /* ── 모달 ── */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; align-items:flex-end; backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); animation:fade .2s ease; }
  @keyframes fade { from{opacity:0} to{opacity:1} }
  .modal { background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0; width:100%; max-width:460px; margin:0 auto; padding:10px 22px 40px; animation:slideUp .28s cubic-bezier(.2,.9,.3,1); max-height:92vh; overflow-y:auto; }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .modal-handle { width:40px; height:5px; background:var(--surface3); border-radius:3px; margin:8px auto 20px; }
  .modal-title { font-size:19px; font-weight:800; margin-bottom:20px; letter-spacing:-0.02em; }
  .field { margin-bottom:14px; }
  .field label { font-size:11px; color:var(--muted); font-weight:700; display:block; margin-bottom:7px; letter-spacing:0.04em; }
  .fi { width:100%; background:var(--surface2); border:1.5px solid transparent; border-radius:var(--radius-sm); padding:13px 15px; font-size:16px; font-weight:600; color:var(--text); outline:none; transition:border .2s, background .2s; }
  .fi:focus { background:var(--surface); border-color:var(--accent); }
  .frow { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .mb { width:100%; padding:15px; border-radius:var(--radius-sm); font-size:15px; font-weight:800; cursor:pointer; margin-top:9px; transition:opacity .15s, transform .12s; }
  .mb:active { transform:scale(0.98); opacity:.85; }
  .mb-p { background:var(--accent); color:white; }
  .mb-s { background:var(--surface2); color:var(--muted); }
  .mb-d { background:color-mix(in srgb, var(--up) 12%, transparent); color:var(--up); }
  .avg-box { background:var(--surface2); border-radius:var(--radius-sm); padding:15px 17px; margin-top:12px; }
  .avg-row { display:flex; justify-content:space-between; font-size:13px; padding:4px 0; }
  .avg-row span:first-child { color:var(--muted); font-weight:500; }
  .avg-row span:last-child { font-weight:800; }
  .lot-list { display:flex; flex-direction:column; gap:7px; margin-bottom:13px; }
  .lot-row { display:flex; justify-content:space-between; align-items:center; background:var(--surface2); border-radius:var(--radius-sm); padding:11px 15px; font-size:13px; font-weight:600; }
  .lot-del { color:var(--up); font-size:20px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; }

  .empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; color:var(--muted); font-size:14px; font-weight:600; padding:70px 40px; text-align:center; }
  .empty-icon { width:56px; height:56px; border-radius:18px; background:var(--surface2); display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
  .empty-icon svg { width:28px; height:28px; stroke:var(--muted2); fill:none; stroke-width:1.8; }

  /* ── FAB ── */
  .fab { position:fixed; bottom:104px; left:50%; transform:translateX(-50%); width:56px; height:56px; border-radius:50%; background:var(--accent); font-size:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 24px color-mix(in srgb, var(--accent) 45%, transparent); z-index:60; color:white; transition:transform .18s; }
  .fab:active { transform:translateX(-50%) scale(0.88); }

  /* ── 마켓 페이지 ── */
  .mpage { padding:6px 0; }
  .sec { padding:18px 22px; }
  .sec-t { font-size:12px; font-weight:800; color:var(--muted); margin-bottom:14px; letter-spacing:0.04em; text-transform:uppercase; }
  .ig { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .ic { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px; box-shadow:var(--shadow-sm); }
  .in { font-size:11px; color:var(--muted); font-weight:700; margin-bottom:6px; }
  .iv { font-size:20px; font-weight:800; letter-spacing:-0.02em; }
  .ich { font-size:13px; font-weight:700; margin-top:3px; }
  .hm { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
  .hc { border-radius:var(--radius-sm); padding:11px 10px; transition:transform .15s; }
  .hc:active { transform:scale(0.96); }
  .hn { font-size:10px; font-weight:700; margin-bottom:4px; line-height:1.3; }
  .hp { font-size:13px; font-weight:800; }
  .fg-wrap { display:flex; align-items:center; gap:20px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:18px; box-shadow:var(--shadow-sm); }
  .fg-num { font-size:40px; font-weight:800; line-height:1; }
  .fg-lbl { font-size:14px; font-weight:800; margin-top:4px; }
  .fg-src { font-size:11px; color:var(--muted); font-weight:500; margin-top:3px; }
  .cr { display:flex; gap:12px; }
  .cc { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:15px 16px; box-shadow:var(--shadow-sm); }
  .cn { font-size:11px; color:var(--muted); font-weight:700; margin-bottom:5px; }
  .cp { font-size:18px; font-weight:800; letter-spacing:-0.02em; }
  .cc2 { font-size:12px; font-weight:700; margin-top:3px; }
  .cc3 { font-size:10px; color:var(--muted); font-weight:500; margin-top:4px; }
  .mybars { display:flex; gap:9px; align-items:flex-end; height:96px; }
  .mbw { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
  .mbl { font-size:9px; color:var(--muted); font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; text-align:center; }
  .mbp { font-size:9px; font-weight:800; }
  .dist { display:flex; height:30px; border-radius:var(--radius-sm); overflow:hidden; gap:3px; }
  .ds { display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; min-width:0; }
  .dl { display:flex; justify-content:space-between; margin-top:8px; font-size:11px; font-weight:700; color:var(--muted); }

  @keyframes sh { 0%,100%{opacity:.4} 50%{opacity:.9} }
  .loading { animation:sh 1.4s ease-in-out infinite; color:var(--muted2); }

  /* ── PIN 설정 ── */
  .pin-hint { font-size:13px; color:var(--muted); font-weight:500; line-height:1.6; margin-bottom:18px; }
  .pin-display { font-family:var(--mono); font-size:15px; font-weight:600; letter-spacing:0.1em; background:var(--surface2); border-radius:var(--radius-sm); padding:13px 16px; text-align:center; margin-bottom:12px; word-break:break-all; }

  ::-webkit-scrollbar { width:0; }
  @keyframes flash-up { 0%{background:color-mix(in srgb, var(--up) 20%, transparent)} 100%{background:transparent} }
  @keyframes flash-down { 0%{background:color-mix(in srgb, var(--down) 20%, transparent)} 100%{background:transparent} }
  .flash-up { animation:flash-up .6s ease; }
  .flash-down { animation:flash-down .6s ease; }
`;

/* ════════════════════════════════════════════════════════════════════
   CONFIG — 환경변수 우선, 없으면 안전한 기본값
   하드코딩 키 제거: import.meta.env 사용 (Vite)
   ════════════════════════════════════════════════════════════════════ */
const SUPA_URL    = import.meta.env.VITE_SUPABASE_URL    || "";
const SUPA_KEY    = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY      || "";
const SUPA_ENABLED = Boolean(SUPA_URL && SUPA_KEY);
const WS_ENABLED   = Boolean(FINNHUB_KEY);

/* ── 세션 경계 상수 (ET 분 단위) ── */
const ET = { PRE_START:240, REG_START:570, REG_END:960, AFT_END:1200 };

/* ── 폴링 주기 (ms) ── */
const POLL = { PRE:10000, AFTER:10000, CLOSED:60000, MARKET_OPEN:30000, MARKET_CLOSED:60000, FX:60000 };

/* ════════════════════════════════════════════════════════════════════
   STORAGE — localStorage 안전 래퍼 + Supabase 동기화
   ════════════════════════════════════════════════════════════════════ */
const store = (() => {
  const mem = {};
  return {
    get: k => { try { return localStorage.getItem(k); } catch { return mem[k] ?? null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { mem[k] = v; } },
  };
})();

function genUserKey() {
  // crypto.randomUUID 우선, fallback 포함
  try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch {}
  return "u-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}
function getUserKey() {
  let k = store.get("portfolio_key");
  if (!k) { k = genUserKey(); store.set("portfolio_key", k); }
  return k;
}

async function supaLoad(userKey, signal) {
  if (!SUPA_ENABLED) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/portfolios?user_key=eq.${encodeURIComponent(userKey)}&select=holdings`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, signal }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows?.[0]?.holdings) return rows[0].holdings;
  } catch {}
  return null;
}

async function supaSave(userKey, holdings, signal) {
  if (!SUPA_ENABLED) return;
  await fetch(`${SUPA_URL}/rest/v1/portfolios`, {
    method: "POST",
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ user_key: userKey, holdings, updated_at: new Date().toISOString() }),
    signal,
  });
}

/* ════════════════════════════════════════════════════════════════════
   FINNHUB WEBSOCKET — 자동 재연결 + 정리
   ════════════════════════════════════════════════════════════════════ */
// 자동 재연결(지수 백오프) WebSocket 매니저.
// teardown 함수를 반환 — 호출 시 재연결 중단 + 소켓 종료.
function startFinnhubStream(tickers, onPrice, onStatus) {
  if (!WS_ENABLED || !tickers.length) return () => {};

  let ws = null;
  let stopped = false;
  let retry = 0;
  let reconnectTimer = null;
  const MAX_DELAY = 30000;

  const connect = () => {
    if (stopped) return;
    try { ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`); }
    catch { onStatus("error"); scheduleReconnect(); return; }

    ws.onopen = () => {
      retry = 0;
      onStatus("connected");
      tickers.forEach(t => { try { ws.send(JSON.stringify({ type: "subscribe", symbol: t })); } catch {} });
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "trade" && msg.data?.length) {
          const latest = {};
          msg.data.forEach(d => { if (!latest[d.s] || d.t > latest[d.s].t) latest[d.s] = d; });
          Object.entries(latest).forEach(([symbol, d]) => onPrice(symbol, d.p));
        }
      } catch {}
    };
    ws.onerror = () => onStatus("error");
    ws.onclose = () => {
      onStatus("closed");
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (stopped || reconnectTimer) return;
    const delay = Math.min(MAX_DELAY, 1000 * 2 ** retry); // 1s,2s,4s…30s
    retry++;
    reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, delay);
  };

  connect();

  // teardown
  return () => {
    stopped = true;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (ws) {
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      try { ws.close(); } catch {}
      ws = null;
    }
  };
}

/* ════════════════════════════════════════════════════════════════════
   PURE HELPERS
   ════════════════════════════════════════════════════════════════════ */
const calcAvg = lots => {
  const q = lots.reduce((s, l) => s + l.qty, 0);
  return q > 0 ? lots.reduce((s, l) => s + l.qty * l.price, 0) / q : 0;
};
const sgn = n => (n > 0 ? "+" : "");
const safeNum = n => (typeof n === "number" && isFinite(n) ? n : null);

function fmtVal(n, cur, rate) {
  if (n == null) return "—";
  if (cur === "KRW") return Math.round(Math.abs(n) * rate).toLocaleString("ko-KR") + "원";
  return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPnl(n, cur, rate) {
  if (n == null) return "—";
  const pre = n >= 0 ? "+" : "-";
  if (cur === "KRW") return pre + Math.round(Math.abs(n) * rate).toLocaleString("ko-KR") + "원";
  return pre + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPrice(n, cur, rate) {
  if (n == null) return "—";
  if (cur === "KRW") return "₩" + Math.round(n * rate).toLocaleString("ko-KR");
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sessionFromET(min, dow) {
  if (dow === 0 || dow === 6) return "closed";
  if (min >= ET.REG_START && min < ET.REG_END) return "regular";
  if (min >= ET.PRE_START && min < ET.REG_START) return "pre";
  if (min >= ET.REG_END && min < ET.AFT_END) return "after";
  return "closed";
}

function getMarketStatus() {
  const now = new Date();
  const kr = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const krStr = `${String(kr.getHours()).padStart(2, "0")}:${String(kr.getMinutes()).padStart(2, "0")}`;
  const etStr = `${String(et.getHours()).padStart(2, "0")}:${String(et.getMinutes()).padStart(2, "0")} ET`;
  const etMin = et.getHours() * 60 + et.getMinutes(), dow = et.getDay();
  const sess = sessionFromET(etMin, dow);
  const MAP = {
    closed: dow === 0 || dow === 6
      ? { label: "주말 휴장", sessionKR: "월요일 재개", dotClass: "closed" }
      : { label: "장 마감", sessionKR: "내일 오후 6시 프리마켓", dotClass: "closed" },
    regular: { label: "정규장 진행중", sessionKR: "오후 11:30 ~ 오전 6:00", dotClass: "open" },
    pre:     { label: "프리마켓",     sessionKR: "오후 6:00 ~ 오후 11:30", dotClass: "pre" },
    after:   { label: "애프터마켓",   sessionKR: "오전 6:00 ~ 오전 9:00",  dotClass: "after" },
  };
  return { status: sess === "regular" ? "open" : sess, ...MAP[sess], krTime: krStr, etTime: etStr };
}

const SESSION_BG = {
  open: "color-mix(in srgb, var(--green) 6%, transparent)",
  pre: "color-mix(in srgb, var(--amber) 6%, transparent)",
  after: "color-mix(in srgb, var(--purple) 6%, transparent)",
  closed: "var(--surface2)",
};

/* ── 색상 (CSS 변수 기반, 하드코딩 최소화) ── */
const PIE_COLORS = [
  "var(--accent)", "var(--up)", "var(--amber)", "var(--green)",
  "var(--purple)", "#5856d6", "#ff2d55", "#00c7be", "#a2845e", "#636366",
];
const LOGO_COLORS = ["#2563eb", "#e0245e", "#f59e0b", "#00b84d", "#8b5cf6", "#5856d6", "#ff2d55", "#00c7be"];
function tickerColor(t) {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % LOGO_COLORS.length;
  return LOGO_COLORS[h];
}

/* ════════════════════════════════════════════════════════════════════
   PRESENTATIONAL COMPONENTS — App 외부 정의 (재마운트 버그 해결)
   ════════════════════════════════════════════════════════════════════ */
function TickerLogo({ ticker }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  if (err || !ticker) {
    return (
      <div className="card-logo" style={{ background: tickerColor(ticker || "?") }}>
        <span className="card-logo-fb">{(ticker || "?").slice(0, 2)}</span>
      </div>
    );
  }
  return (
    <div className="card-logo" style={{ background: loaded ? "var(--surface)" : "var(--surface3)" }}>
      <img src={`/api/logo?ticker=${ticker}`} alt={ticker}
        onLoad={() => setLoaded(true)} onError={() => setErr(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", opacity: loaded ? 1 : 0, transition: "opacity .25s" }} />
    </div>
  );
}

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.val, 0);
  if (!total) return null;
  let angle = -90;
  const r = 60, cx = 70, cy = 70;
  const slices = data.map((d, i) => {
    const deg = (d.val / total) * 360;
    const rad1 = (angle * Math.PI) / 180, rad2 = ((angle + deg) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
    const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
    const large = deg > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle += deg;
    return { path, color: PIE_COLORS[i % PIE_COLORS.length] };
  });
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="var(--surface)" strokeWidth="2.5" />)}
      <circle cx={cx} cy={cy} r={38} fill="var(--surface)" />
    </svg>
  );
}

function FGArc({ v }) {
  const pct = Math.min(Math.max(v, 0), 100) / 100;
  const r = 38, cx = 45, cy = 45;
  const ex = cx - r * Math.cos(pct * Math.PI), ey = cy - r * Math.sin(pct * Math.PI);
  const col = v < 25 ? "var(--up)" : v < 45 ? "var(--amber)" : v < 55 ? "var(--muted)" : "var(--green)";
  return (
    <svg width="90" height="50" viewBox="0 0 90 50">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--surface3)" strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function secColor(pct) {
  if (pct == null) return { bg: "var(--surface2)", tx: "var(--muted)" };
  if (pct >= 1)   return { bg: "color-mix(in srgb, var(--green) 90%, black 10%)", tx: "#fff" };
  if (pct >= 0.2) return { bg: "color-mix(in srgb, var(--green) 18%, transparent)", tx: "var(--green)" };
  if (pct >= 0)   return { bg: "color-mix(in srgb, var(--green) 9%, transparent)", tx: "var(--green)" };
  if (pct >= -0.2)return { bg: "color-mix(in srgb, var(--up) 9%, transparent)", tx: "var(--up)" };
  if (pct >= -1)  return { bg: "color-mix(in srgb, var(--up) 18%, transparent)", tx: "var(--up)" };
  return            { bg: "color-mix(in srgb, var(--up) 90%, black 10%)", tx: "#fff" };
}

/* ── 헤더+배너+환율 (App 외부, props 전달) ── */
const Icon = {
  refresh: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>,
  grid: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>,
  chart: <svg viewBox="0 0 24 24"><polyline points="2 16 8 10 13 15 22 6"/><polyline points="16 6 22 6 22 12"/></svg>,
  empty: <svg viewBox="0 0 24 24"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>,
};

function HeaderBannerFx({ page, currency, setCurrency, onRefresh, spinning, dataSource, wsStatus, session, ms, fxData }) {
  const srcLabel = dataSource === "finnhub"
    ? (wsStatus === "connected" ? "실시간 틱" : "연결중…")
    : session === "pre" ? "프리 · 10초"
    : session === "after" ? "애프터 · 10초"
    : session === "closed" ? "마감 · 60초" : "Yahoo";
  const srcDotClass = dataSource === "finnhub" && wsStatus === "connected" ? "live"
    : session === "closed" ? "off" : "poll";
  return (
    <>
      <div className="header">
        <span className="header-title">{page === "portfolio" ? "내 포트폴리오" : "마켓 인사이트"}</span>
        <div className="header-right">
          <div className="currency-toggle">
            <button className={`curr-btn ${currency === "USD" ? "active" : ""}`} onClick={() => setCurrency("USD")}>$</button>
            <button className={`curr-btn ${currency === "KRW" ? "active" : ""}`} onClick={() => setCurrency("KRW")}>₩</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <button className={`refresh-btn ${spinning ? "spinning" : ""}`} onClick={onRefresh} aria-label="새로고침">{Icon.refresh}</button>
            <span className="src-pill"><span className={`src-dot ${srcDotClass}`} />{srcLabel}</span>
          </div>
        </div>
      </div>
      <div className="market-banner" style={{ background: SESSION_BG[ms.status] }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className={`banner-dot ${ms.dotClass}`} />
          <div>
            <div className="banner-status">{ms.label}</div>
            <div className="banner-time">{ms.sessionKR}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="banner-kr-time mono">🇰🇷 {ms.krTime}</div>
          <div className="banner-us-time mono">{ms.etTime}</div>
        </div>
      </div>
      <div className="fx-card">
        <div className="fx-left">
          <span className="fx-flag">💱</span>
          <div>
            <div className="fx-label">USD / KRW · 실시간 환율</div>
            <div className="fx-rate-big mono">₩{fxData.rate.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}</div>
          </div>
        </div>
        <div className="fx-right">
          <div className={`fx-chg ${fxData.chg >= 0 ? "pos" : "neg"}`}>{sgn(fxData.chg)}{Math.abs(fxData.chg).toFixed(2)}%</div>
          <div className="fx-src">24H · Yahoo Finance</div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   APP
   ════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("portfolio");
  const [subTab, setSubTab] = useState("평가");
  const [currency, setCurrency] = useState("USD");
  const [fxData, setFxData] = useState({ rate: 1350, chg: 0 });
  const [holdings, setHoldings] = useState(() => {
    try { return JSON.parse(store.get("hv9") || "{}"); } catch { return {}; }
  });
  const [syncStatus, setSyncStatus] = useState("idle");
  const [quotes, setQuotes] = useState({});
  const [spinning, setSpinning] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [mkt, setMkt] = useState(null);
  const [binance, setBinance] = useState({});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ ticker: "", qty: "", price: "" });
  const [lots, setLots] = useState([]);
  const [ms, setMs] = useState(getMarketStatus());
  const [session, setSession] = useState("closed");
  const [dataSource, setDataSource] = useState("yahoo");
  const [wsStatus, setWsStatus] = useState("idle");
  const [visible, setVisible] = useState(true);

  const userKey = useRef(getUserKey());
  const didMount = useRef(false);

  // 티커 목록 — 안정적 의존성 (정렬된 문자열)
  const tickerKey = useMemo(
    () => Object.keys(holdings).sort().join(","),
    [holdings]
  );

  /* ── 시장 상태 시계 (30초) ── */
  useEffect(() => {
    const id = setInterval(() => setMs(getMarketStatus()), 30000);
    return () => clearInterval(id);
  }, []);

  /* ── 세션 감지 (30초) ── */
  useEffect(() => {
    const check = () => {
      const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
      setSession(sessionFromET(et.getHours() * 60 + et.getMinutes(), et.getDay()));
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  /* ── 화면 가시성 ── */
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* ── localStorage 즉시 저장 + Supabase 디바운스 저장 ── */
  useEffect(() => {
    store.set("hv9", JSON.stringify(holdings));
    // 첫 마운트(로컬에서 복원)는 저장 스킵 — 불필요한 클라우드 쓰기 방지
    if (!didMount.current) { didMount.current = true; return; }
    if (!SUPA_ENABLED) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setSyncStatus("syncing");
      supaSave(userKey.current, holdings, ctrl.signal)
        .then(() => setSyncStatus("synced"))
        .catch((e) => { if (e.name !== "AbortError") setSyncStatus("error"); });
    }, 1000);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [holdings]);

  /* ── 최초 1회: Supabase에서 로드 ── */
  useEffect(() => {
    if (!SUPA_ENABLED) return;
    const ctrl = new AbortController();
    supaLoad(userKey.current, ctrl.signal).then((data) => {
      if (data && Object.keys(data).length > 0) {
        setHoldings((prev) => (Object.keys(prev).length === 0 ? data : prev));
      }
    });
    return () => ctrl.abort();
  }, []);

  /* ── 환율 조회 (마운트 시 + 주기적) ── */
  const refreshFx = useCallback(async () => {
    try {
      const res = await fetch("/api/fx", { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error("fx");
      const d = await res.json();
      if (d?.rate > 100) setFxData({ rate: Number(d.rate), chg: Number(d.chg ?? 0) });
    } catch {}
  }, []);

  useEffect(() => {
    refreshFx();
    const id = setInterval(refreshFx, POLL.FX);
    return () => clearInterval(id);
  }, [refreshFx]);

  /* ── 가격 조회 (REST) ── */
  const refreshPrices = useCallback(async () => {
    const tks = tickerKey ? tickerKey.split(",") : [];
    if (!tks.length) return;
    setSpinning(true); setErrMsg(null);
    try {
      const res = await fetch(`/api/prices?tickers=${tks.join(",")}`, { signal: AbortSignal.timeout(10000) });
      const raw = await res.json();
      const out = {};
      Object.entries(raw).forEach(([k, v]) => { if (!k.startsWith("_") && v) out[k.toUpperCase()] = v; });
      if (!Object.keys(out).length) throw new Error("empty");
      setQuotes((q) => ({ ...q, ...out }));
    } catch { setErrMsg("가격 조회 실패 — 잠시 후 재시도"); }
    finally { setSpinning(false); }
  }, [tickerKey]);

  /* ── 시장 데이터 조회 ── */
  const refreshMarket = useCallback(async () => {
    try {
      const [mktData, binRes] = await Promise.all([
        fetch("/api/market", { signal: AbortSignal.timeout(10000) }).then((r) => r.json()).catch(() => null),
        Promise.all(["BTCUSDT", "ETHUSDT"].map((sym) =>
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`)
            .then((r) => r.json())
            .then((d) => [sym, { price: parseFloat(d.lastPrice), change_pct: parseFloat(d.priceChangePercent), high: parseFloat(d.highPrice) }])
            .catch(() => [sym, null])
        )).then(Object.fromEntries),
      ]);
      if (mktData) setMkt(mktData);
      setBinance(binRes);
    } catch {}
  }, []);

  /* ── 가격 스트림: WS(정규장, 자동재연결) / 폴링(그 외) ── */
  useEffect(() => {
    if (!visible) return; // 화면 꺼지면 아무 연결도 안 함

    const tks = tickerKey ? tickerKey.split(",") : [];
    if (!tks.length) return;

    // 정규장 + WS 사용 가능 → WebSocket 스트림 (끊기면 내부에서 자동 재연결)
    if (session === "regular" && WS_ENABLED) {
      setDataSource("finnhub");
      refreshPrices(); // 전일종가/등락률 보조 (WS는 체결가만 제공)

      // WS 미체결 종목(암호화폐 등 일부)을 위해 저빈도 보조 폴링 유지
      const auxId = setInterval(refreshPrices, 30000);

      const teardown = startFinnhubStream(
        tks,
        (symbol, price) => setQuotes((q) => ({ ...q, [symbol]: { ...(q[symbol] || {}), price } })),
        (status) => setWsStatus(status)
      );

      return () => { teardown(); clearInterval(auxId); };
    }

    // 그 외(프리/애프터/마감/주말) → REST 폴링
    setDataSource("yahoo");
    setWsStatus("idle");
    refreshPrices();
    const interval = session === "closed" ? POLL.CLOSED : POLL.PRE;
    const id = setInterval(refreshPrices, interval);
    return () => clearInterval(id);
  }, [session, visible, tickerKey, refreshPrices]);

  /* ── 마켓 탭 폴링 ── */
  useEffect(() => {
    if (page !== "market") return;
    refreshMarket();
    const interval = session === "regular" ? POLL.MARKET_OPEN : POLL.MARKET_CLOSED;
    const id = setInterval(refreshMarket, interval);
    return () => clearInterval(id);
  }, [page, session, refreshMarket]);

  /* ════════ 파생 데이터 — useMemo로 캐싱 (틱마다 재계산 방지) ════════ */
  const statsMap = useMemo(() => {
    const map = {};
    Object.keys(holdings).forEach((t) => {
      const h = holdings[t];
      if (!h) return;
      const q = quotes[t];
      const price = safeNum(q?.price), prev = safeNum(q?.prev_close), chgPct = safeNum(q?.change_pct);
      const pre = safeNum(q?.pre_market), after = safeNum(q?.after_market);
      const avg = calcAvg(h.lots), qty = h.lots.reduce((s, l) => s + l.qty, 0);
      const cost = avg * qty, cur = price != null ? price * qty : null;
      const pnl = cur != null ? cur - cost : null;
      map[t] = {
        price, prev, chgPct, pre, after,
        preChgPct: pre != null && prev ? ((pre - prev) / prev) * 100 : null,
        afterChgPct: after != null && prev ? ((after - prev) / prev) * 100 : null,
        avg, qty, cost, cur, pnl,
        pnlPct: cost > 0 && pnl != null ? (pnl / cost) * 100 : null,
        dayAmt: price != null && prev != null ? (price - prev) * qty : null,
      };
    });
    return map;
  }, [holdings, quotes]);

  const tks = useMemo(() => Object.keys(holdings), [holdings]);

  const tot = useMemo(() => {
    let tv = 0, tc = 0, dayPnl = 0;
    tks.forEach((t) => {
      const s = statsMap[t];
      if (s?.cur != null) { tv += s.cur; tc += s.cost; }
      if (s?.dayAmt != null) dayPnl += s.dayAmt;
    });
    return { tv, tc, pnl: tv - tc, pct: tc > 0 ? ((tv - tc) / tc) * 100 : null, dayPnl };
  }, [tks, statsMap]);

  const totalVal = useMemo(
    () => tks.reduce((s, t) => s + (statsMap[t]?.cur ?? 0), 0),
    [tks, statsMap]
  );

  const pieData = useMemo(
    () => tks.map((t) => ({ ticker: t, val: statsMap[t]?.cur ?? 0 })).filter((d) => d.val > 0),
    [tks, statsMap]
  );

  const dist = useMemo(() => {
    let up = 0, flat = 0, down = 0;
    tks.forEach((t) => {
      const c = statsMap[t]?.chgPct ?? 0;
      if (Math.abs(c) <= 0.1) flat++;
      else if (c > 0) up++;
      else down++;
    });
    return { up, flat, down };
  }, [tks, statsMap]);

  /* ── 모달 미리보기 (useMemo) ── */
  const preview = useMemo(() => {
    const q = parseFloat(form.qty), p = parseFloat(form.price);
    const pl = [...lots];
    if (q > 0 && p > 0) pl.push({ qty: q, price: p });
    return { lots: pl, avg: pl.length ? calcAvg(pl) : null, qty: pl.reduce((s, l) => s + l.qty, 0) };
  }, [lots, form.qty, form.price]);

  const CR = currency === "KRW" ? fxData.rate : 1;
  const isEdit = modal && modal !== "add";

  /* ── 핸들러 ── */
  const openAdd = () => { setForm({ ticker: "", qty: "", price: "" }); setLots([]); setModal("add"); };
  const openEdit = (t) => { setLots(holdings[t].lots.map((l, i) => ({ ...l, id: i }))); setForm({ ticker: t, qty: "", price: "" }); setModal(t); };
  const closeModal = () => { setModal(null); setLots([]); setForm({ ticker: "", qty: "", price: "" }); };

  const doSave = () => {
    const ticker = form.ticker.trim().toUpperCase();
    if (!ticker) return;
    const fl = [...lots];
    const q = parseFloat(form.qty), p = parseFloat(form.price);
    if (q > 0 && p > 0) fl.push({ qty: q, price: p, id: Date.now() });
    if (!fl.length) return;
    setHoldings((h) => ({ ...h, [ticker]: { name: ticker, lots: fl } }));
    closeModal();
  };
  const doSaveEdit = () => {
    const fl = [...lots];
    const q = parseFloat(form.qty), p = parseFloat(form.price);
    if (q > 0 && p > 0) fl.push({ qty: q, price: p, id: Date.now() });
    if (!fl.length) { doDel(modal); return; }
    setHoldings((h) => ({ ...h, [modal]: { ...h[modal], lots: fl } }));
    closeModal();
  };
  const doDel = (t) => { setHoldings((h) => { const n = { ...h }; delete n[t]; return n; }); closeModal(); };
  const addLot = () => {
    const q = parseFloat(form.qty), p = parseFloat(form.price);
    if (q > 0 && p > 0) { setLots((l) => [...l, { qty: q, price: p, id: Date.now() }]); setForm((f) => ({ ...f, qty: "", price: "" })); }
  };

  const secNames = ["Technology", "Energy", "Healthcare", "Financials", "Consumer Disc", "Industrials", "Utilities", "Real Estate", "Materials"];
  const fg = mkt?.fear_greed?.score ?? 50;
  const fgCol = fg < 45 ? "var(--up)" : fg < 55 ? "var(--muted)" : "var(--green)";
  const btc = binance["BTCUSDT"], eth = binance["ETHUSDT"];
  const maxPnlAbs = useMemo(() => Math.max(...tks.map((t) => Math.abs(statsMap[t]?.pnl ?? 0)), 1), [tks, statsMap]);

  const headerProps = { page, currency, setCurrency, spinning, dataSource, wsStatus, session, ms, fxData };

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* ══════════ PORTFOLIO ══════════ */}
        {page === "portfolio" && (
          <>
            <HeaderBannerFx {...headerProps} fxData={fxData}
              onRefresh={() => { refreshPrices(); refreshFx(); }} />

            {SUPA_ENABLED && (
              <div className="sync-row">
                {syncStatus === "syncing" && <><span className="sync-dot" style={{ background: "var(--amber)" }} />클라우드 저장중…</>}
                {syncStatus === "synced" && <><span className="sync-dot" style={{ background: "var(--green)" }} />클라우드 저장됨 · 기기 공유 가능</>}
                {syncStatus === "error" && <><span className="sync-dot" style={{ background: "var(--up)" }} />저장 실패 · 로컬에만 보관</>}
              </div>
            )}

            <div className="total-block">
              <div className="total-value mono">{tot.tv > 0 ? fmtVal(tot.tv, currency, CR) : "—"}</div>
              {tot.pnl != null && tot.pnl !== 0 && (
                <div className="total-sub">
                  <span className={tot.pnl > 0 ? "pos" : "neg"}>{fmtPnl(tot.pnl, currency, CR)}</span>
                  <span className={`pnl-pill ${tot.pnl > 0 ? "pos" : "neg"}`}>{sgn(tot.pct)}{tot.pct?.toFixed(2)}%</span>
                </div>
              )}
              {tot.dayPnl !== 0 && (
                <div className={`total-day ${tot.dayPnl > 0 ? "pos" : "neg"}`}>오늘 {fmtPnl(tot.dayPnl, currency, CR)}</div>
              )}
              {errMsg && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{errMsg}</div>}
            </div>

            <div className="sub-tabs">
              {["평가", "수익", "비중"].map((t) => (
                <button key={t} className={`sub-tab ${subTab === t ? "active" : ""}`} onClick={() => setSubTab(t)}>{t}</button>
              ))}
            </div>

            {/* ── 평가 뷰 ── */}
            {subTab === "평가" && (
              <div className="list">
                {tks.length === 0 ? (
                  <div className="empty"><div className="empty-icon">{Icon.empty}</div><div>보유 종목이 없습니다</div><div style={{ fontSize: 12, opacity: .6 }}>+ 버튼으로 추가하세요</div></div>
                ) : tks.map((t) => {
                  const s = statsMap[t], loaded = s?.price != null, pos = s?.pnl == null ? null : s.pnl >= 0;
                  return (
                    <div key={t} className="card" onClick={() => openEdit(t)}>
                      <TickerLogo ticker={t} />
                      <div className="card-mid">
                        <div className="card-ticker">{t}</div>
                        <div className="card-shares">{s?.qty ?? 0}주 · 평균 {fmtPrice(s?.avg, currency, CR)}</div>
                      </div>
                      <div className="card-right">
                        {loaded ? (
                          <>
                            <div className="card-cur mono">{fmtPrice(s.price, currency, CR)}</div>
                            <div className="card-value mono">{fmtVal(s.cur, currency, CR)}</div>
                            <div className={`card-pnl ${pos === true ? "pos" : pos === false ? "neg" : "neu"}`}>
                              {s.pnl != null ? `${fmtPnl(s.pnl, currency, CR)} (${sgn(s.pnlPct)}${s.pnlPct?.toFixed(2)}%)` : "—"}
                            </div>
                            <div className={`card-daychg ${s.chgPct == null ? "neu" : s.chgPct >= 0 ? "pos" : "neg"}`}>
                              {s.chgPct != null ? `오늘 ${sgn(s.chgPct)}${s.chgPct?.toFixed(2)}%` : ""}
                            </div>
                            {ms.status === "pre" && s.pre != null && <span className="ext-badge ext-pre">Pre {sgn(s.preChgPct)}{s.preChgPct?.toFixed(2)}%</span>}
                            {ms.status === "after" && s.after != null && <span className="ext-badge ext-after">After {sgn(s.afterChgPct)}{s.afterChgPct?.toFixed(2)}%</span>}
                          </>
                        ) : <div className="card-value loading">로딩…</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── 수익 뷰 ── */}
            {subTab === "수익" && (
              <div className="list">
                {tks.length === 0 ? (
                  <div className="empty"><div className="empty-icon">{Icon.chart}</div><div>종목을 추가하세요</div></div>
                ) : tks.map((t) => {
                  const s = statsMap[t], pnl = s?.pnl ?? 0, pnlPct = s?.pnlPct ?? 0, pos = pnl >= 0;
                  const barW = Math.min(100, (Math.abs(pnl) / maxPnlAbs) * 100);
                  return (
                    <div key={t} className="profit-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                        <TickerLogo ticker={t} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: 15, fontWeight: 800 }}>{t}</span>
                            <span className={`mono ${pos ? "pos" : "neg"}`} style={{ fontSize: 14, fontWeight: 800 }}>{fmtPnl(pnl, currency, CR)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{s?.qty ?? 0}주</span>
                            <span className={pos ? "pos" : "neg"} style={{ fontSize: 12, fontWeight: 700 }}>{sgn(pnlPct)}{pnlPct?.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bar-bg"><div className="bar-fg" style={{ width: `${barW}%`, background: pos ? "var(--up)" : "var(--down)" }} /></div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── 비중 뷰 ── */}
            {subTab === "비중" && (
              tks.length === 0 ? (
                <div className="empty"><div className="empty-icon">{Icon.grid}</div><div>종목을 추가하세요</div></div>
              ) : (
                <>
                  <div className="pie-section">
                    <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
                      <PieChart data={pieData} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                        {pieData.map((d, i) => (
                          <div key={d.ticker} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, fontWeight: 600 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{d.ticker}</span>
                            <span style={{ fontWeight: 800 }}>{totalVal > 0 ? ((d.val / totalVal) * 100).toFixed(1) : "0.0"}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="list">
                    {tks.map((t, i) => {
                      const s = statsMap[t], pct = totalVal > 0 ? ((s?.cur ?? 0) / totalVal) * 100 : 0;
                      return (
                        <div key={t} className="card" onClick={() => openEdit(t)}>
                          <TickerLogo ticker={t} />
                          <div className="card-mid">
                            <div className="card-ticker">{t}</div>
                            <div className="card-shares mono">{fmtVal(s?.cur, currency, CR)}</div>
                          </div>
                          <div className="card-right">
                            <div style={{ fontSize: 22, fontWeight: 800, color: PIE_COLORS[i % PIE_COLORS.length] }}>{pct.toFixed(1)}%</div>
                            <div style={{ marginTop: 5, height: 5, width: 64, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 3 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            )}

            <button className="fab" onClick={openAdd} aria-label="종목 추가">+</button>
          </>
        )}

        {/* ══════════ MARKET ══════════ */}
        {page === "market" && (
          <>
            <HeaderBannerFx {...headerProps} fxData={fxData} onRefresh={refreshMarket} />
            <div className="mpage">
              <div className="sec">
                <div className="sec-t">주요 지수</div>
                <div className="ig">
                  {[["S&P 500", "SP500"], ["NASDAQ", "NASDAQ"], ["DOW", "DOW"], ["VIX", "VIX"]].map(([lbl, k]) => {
                    const d = mkt?.indices?.[k];
                    return (
                      <div key={k} className="ic">
                        <div className="in">{lbl}</div>
                        <div className="iv mono">{d?.value != null ? (k === "VIX" ? d.value.toFixed(2) : d.value.toLocaleString("en-US", { maximumFractionDigits: 0 })) : "—"}</div>
                        <div className={`ich ${d?.change_pct == null ? "neu" : d.change_pct >= 0 ? "pos" : "neg"}`}>{d?.change_pct != null ? `${sgn(d.change_pct)}${d.change_pct.toFixed(2)}%` : "—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sec">
                <div className="sec-t">섹터 히트맵</div>
                <div className="hm">
                  {secNames.map((n) => {
                    const pct = mkt?.sectors?.[n] ?? null, col = secColor(pct);
                    return (
                      <div key={n} className="hc" style={{ background: col.bg }}>
                        <div className="hn" style={{ color: col.tx }}>{n}</div>
                        <div className="hp mono" style={{ color: col.tx }}>{pct != null ? `${sgn(pct)}${pct.toFixed(2)}%` : "—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sec">
                <div className="sec-t">공포·탐욕 지수</div>
                <div className="fg-wrap">
                  <FGArc v={fg} />
                  <div>
                    <div className="fg-num mono" style={{ color: fgCol }}>{fg}</div>
                    <div className="fg-lbl" style={{ color: fgCol }}>{mkt?.fear_greed?.label ?? "Neutral"}</div>
                    <div className="fg-src">CNN Money</div>
                  </div>
                </div>
              </div>

              <div className="sec">
                <div className="sec-t">암호화폐 · Binance 24H</div>
                <div className="cr">
                  {[["BTC", "BTCUSDT", btc], ["ETH", "ETHUSDT", eth]].map(([sym, pair, d]) => (
                    <div key={sym} className="cc">
                      <div className="cn">{pair}</div>
                      <div className="cp mono">{d?.price != null ? (currency === "KRW" ? "₩" + Math.round(d.price * fxData.rate).toLocaleString("ko-KR") : "$" + Math.round(d.price).toLocaleString("en-US")) : "—"}</div>
                      <div className={`cc2 ${d?.change_pct == null ? "neu" : d.change_pct >= 0 ? "pos" : "neg"}`}>{d?.change_pct != null ? `${sgn(d.change_pct)}${d.change_pct.toFixed(2)}%` : "—"}</div>
                      <div className="cc3">24H 고가 {d?.high ? "$" + Math.round(d.high).toLocaleString() : ""}</div>
                    </div>
                  ))}
                </div>
              </div>

              {tks.length > 0 && (
                <div className="sec">
                  <div className="sec-t">내 종목 오늘</div>
                  <div className="mybars">
                    {tks.map((t) => {
                      const s = statsMap[t], chg = s?.chgPct ?? null, pos = (chg ?? 0) >= 0;
                      const h = Math.max(4, Math.min(74, Math.abs(chg ?? 0) * 18 + 6));
                      return (
                        <div key={t} className="mbw">
                          <div className={`mbp ${pos ? "pos" : "neg"}`}>{chg != null ? `${sgn(chg)}${chg.toFixed(1)}%` : "—"}</div>
                          <div style={{ height: h, background: pos ? "var(--up)" : "var(--down)", borderRadius: 5, width: "100%" }} />
                          <div className="mbl">{t}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tks.length > 0 && (
                <div className="sec">
                  <div className="sec-t">등락 분포</div>
                  <div className="dist">
                    <div className="ds" style={{ flex: dist.up || .01, background: "color-mix(in srgb, var(--up) 22%, transparent)", color: "var(--up)" }}>{dist.up || ""}</div>
                    <div className="ds" style={{ flex: dist.flat || .01, background: "var(--surface2)", color: "var(--muted)" }}>{dist.flat || ""}</div>
                    <div className="ds" style={{ flex: dist.down || .01, background: "color-mix(in srgb, var(--down) 22%, transparent)", color: "var(--down)" }}>{dist.down || ""}</div>
                  </div>
                  <div className="dl">
                    <span style={{ color: "var(--up)" }}>▲ {dist.up} 상승</span>
                    <span>{dist.flat} 보합</span>
                    <span style={{ color: "var(--down)" }}>▼ {dist.down} 하락</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════ MODAL ══════════ */}
        {modal && (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <div className="modal">
              <div className="modal-handle" />
              <div className="modal-title">{isEdit ? `${modal} 수정` : "종목 추가"}</div>
              {!isEdit && (
                <div className="field">
                  <label>티커</label>
                  <input className="fi" placeholder="AAPL, TSLA, NVDA…" value={form.ticker}
                    onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))} />
                </div>
              )}
              {lots.length > 0 && (
                <div className="lot-list">
                  {lots.map((l) => (
                    <div key={l.id} className="lot-row">
                      <span style={{ color: "var(--muted)" }}>{l.qty}주 @ ${l.price.toFixed(2)}</span>
                      <button className="lot-del" onClick={() => setLots((ls) => ls.filter((x) => x.id !== l.id))}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="frow">
                <div className="field"><label>수량</label><input className="fi mono" type="number" inputMode="decimal" placeholder="10" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} /></div>
                <div className="field"><label>매입가 ($)</label><input className="fi mono" type="number" inputMode="decimal" placeholder="150.00" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></div>
              </div>
              {preview.avg != null && (
                <div className="avg-box">
                  <div className="avg-row"><span>평균단가</span><span className="mono">${preview.avg.toFixed(2)}</span></div>
                  <div className="avg-row"><span>총 수량</span><span className="mono">{preview.qty}주</span></div>
                  <div className="avg-row"><span>매입금액 ($)</span><span className="mono">${(preview.avg * preview.qty).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span></div>
                  <div className="avg-row"><span>매입금액 (₩)</span><span className="mono">₩{Math.round(preview.avg * preview.qty * fxData.rate).toLocaleString("ko-KR")}</span></div>
                </div>
              )}
              <button className="mb mb-s" style={{ marginTop: 10 }} onClick={addLot}>+ 분할매수 추가</button>
              <button className="mb mb-p" style={{ marginTop: 12 }} onClick={isEdit ? doSaveEdit : doSave}>{isEdit ? "저장" : "추가"}</button>
              {isEdit && <button className="mb mb-d" onClick={() => doDel(modal)}>종목 삭제</button>}
              <button className="mb mb-s" onClick={closeModal}>취소</button>
            </div>
          </div>
        )}

        {/* ══════════ NAV ══════════ */}
        <nav className="nav">
          <button className={`nav-btn ${page === "portfolio" ? "active" : ""}`} onClick={() => { setPage("portfolio"); setSubTab("평가"); }}>
            {Icon.grid}자산
          </button>
          <button className={`nav-btn ${page === "market" ? "active" : ""}`} onClick={() => setPage("market")}>
            {Icon.chart}마켓
          </button>
        </nav>
      </div>
    </>
  );
}
