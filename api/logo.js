// api/logo.js — Vercel 서버리스 로고 프록시
// 티커 → TradingView 심볼명 매핑 (500+ 종목)
const TV_MAP = {
  // 빅테크
  AAPL:'apple', MSFT:'microsoft', NVDA:'nvidia', GOOGL:'alphabet', GOOG:'alphabet',
  META:'meta-platforms', AMZN:'amazon', TSLA:'tesla', NFLX:'netflix',
  // 반도체
  AMD:'advanced-micro-devices', INTC:'intel', QCOM:'qualcomm', AVGO:'broadcom',
  TSM:'taiwan-semiconductor', SMCI:'super-micro-computer', ARM:'arm-holdings',
  AMAT:'applied-materials', LRCX:'lam-research', KLAC:'kla',
  MRVL:'marvell-technology', ASML:'asml-holding', MU:'micron-technology',
  TXN:'texas-instruments', MPWR:'monolithic-power-systems', ON:'on-semiconductor',
  // 소프트웨어/클라우드
  CRM:'salesforce', ORCL:'oracle', SAP:'sap', NOW:'servicenow',
  SNOW:'snowflake', DDOG:'datadog', MDB:'mongodb', NET:'cloudflare',
  CRWD:'crowdstrike-holdings', PANW:'palo-alto-networks', ZS:'zscaler',
  OKTA:'okta', TEAM:'atlassian', WDAY:'workday', ADBE:'adobe',
  INTU:'intuit', ANSS:'ansys', CDNS:'cadence-design-systems',
  SNPS:'synopsys', PTC:'ptc', VEEV:'veeva-systems', HUBS:'hubspot',
  BILL:'bill-holdings', GTLB:'gitlab', PATH:'uipath', AI:'c3-ai',
  BBAI:'bigbear-ai', SOUN:'soundhound-ai', IONQ:'ionq',
  // 핀테크/금융
  V:'visa', MA:'mastercard', PYPL:'paypal', SQ:'block',
  COIN:'coinbase-global', HOOD:'robinhood-markets', SOFI:'sofi-technologies',
  AFRM:'affirm-holdings', UPST:'upst', LC:'lending-club',
  NU:'nu-holdings', STNE:'stoneco', PAGS:'pagseguro-digital',
  // 이커머스/소비재
  SHOP:'shopify', ETSY:'etsy', EBAY:'ebay', W:'wayfair',
  CHWY:'chewy', CVNA:'carvana', CARG:'cargurus', ABNB:'airbnb',
  BKNG:'booking-holdings', EXPE:'expedia-group', TRIP:'tripadvisor',
  UBER:'uber-technologies', LYFT:'lyft', DASH:'doordash',
  // 소셜/미디어
  SNAP:'snap', PINS:'pinterest', RDDT:'reddit', SPOT:'spotify-technology',
  MTCH:'match-group', ZM:'zoom-video-communications', RBLX:'roblox',
  U:'unity-software', EA:'electronic-arts', TTWO:'take-two-interactive',
  ATVI:'activision-blizzard', NTES:'netease',
  // 헬스케어/바이오
  JNJ:'johnson-johnson', PFE:'pfizer', MRNA:'moderna', BNTX:'biontech',
  ABBV:'abbvie', MRK:'merck', LLY:'eli-lilly', BMY:'bristol-myers-squibb',
  GILD:'gilead-sciences', REGN:'regeneron-pharmaceuticals',
  VRTX:'vertex-pharmaceuticals', AMGN:'amgen', BIIB:'biogen',
  ILMN:'illumina', DXCM:'dexcom', ISRG:'intuitive-surgical',
  IDXX:'idexx-laboratories', ZBH:'zimmer-biomet-holdings',
  // 에너지
  XOM:'exxon-mobil', CVX:'chevron', COP:'conocophillips',
  SLB:'schlumberger', HAL:'halliburton', BKR:'baker-hughes',
  OXY:'occidental-petroleum', PSX:'phillips-66', VLO:'valero-energy',
  MPC:'marathon-petroleum', DVN:'devon-energy', FANG:'diamondback-energy',
  // 자동차
  F:'ford-motor', GM:'general-motors', RIVN:'rivian-automotive',
  LCID:'lucid-group', NIO:'nio', LI:'li-auto', XPEV:'xpeng',
  // 항공우주/방산
  BA:'boeing', LMT:'lockheed-martin', RTX:'raytheon-technologies',
  GD:'general-dynamics', NOC:'northrop-grumman', RKLB:'rocket-lab-usa',
  SPCE:'virgin-galactic-holdings', ASTS:'ast-spacemobile',
  // 금융/보험
  JPM:'jpmorgan-chase', BAC:'bank-of-america', WFC:'wells-fargo',
  GS:'goldman-sachs', MS:'morgan-stanley', C:'citigroup',
  AXP:'american-express', BLK:'blackrock', SCHW:'charles-schwab',
  BX:'blackstone', KKR:'kkr', APO:'apollo-global-management',
  ALL:'allstate', MET:'metlife', PRU:'prudential-financial',
  // 소비재/리테일
  WMT:'walmart', TGT:'target', COST:'costco-wholesale',
  HD:'home-depot', LOW:'lowes-companies', TJX:'tjx-companies',
  ROST:'ross-stores', DG:'dollar-general', DLTR:'dollar-tree',
  KR:'kroger', SFM:'sprouts-farmers-market',
  // 식음료
  MCD:"mcdonalds", SBUX:'starbucks', YUM:'yum-brands', DPZ:"dominos-pizza",
  CMG:'chipotle-mexican-grill', QSR:'restaurant-brands-international',
  KO:'coca-cola', PEP:'pepsico', MNST:'monster-beverage',
  PM:'philip-morris-international', MO:'altria-group',
  // 산업재
  CAT:'caterpillar', DE:'deere', MMM:'3m', HON:'honeywell-international',
  GE:'general-electric', EMR:'emerson-electric', ETN:'eaton',
  PH:'parker-hannifin', ROK:'rockwell-automation', IR:'ingersoll-rand',
  // 통신
  T:'at-t', VZ:'verizon-communications', TMUS:'t-mobile-us',
  CMCSA:'comcast', CHTR:'charter-communications', DISH:'dish-network',
  // 부동산
  AMT:'american-tower', PLD:'prologis', EQIX:'equinix',
  CCI:'crown-castle', SBAC:'sba-communications', DLR:'digital-realty-trust',
  // 유틸리티
  NEE:'nextera-energy', DUK:'duke-energy', SO:'southern',
  AEP:'american-electric-power', XEL:'xcel-energy', EXC:'exelon',
  // 광업/소재
  NEM:'newmont', FCX:'freeport-mcmoran', AA:'alcoa', NUE:'nucor',
  MP:'mp-materials', VALE:'vale',
  // 크립토 관련
  MSTR:'microstrategy', MARA:'marathon-digital', RIOT:'riot-platforms',
  CLSK:'cleanspark', BTBT:'bit-digital', HUT:'hut-8-mining',
  BTDR:'bitdeer-technologies', CIFR:'cipher-mining',
  // AI 특화
  PLTR:'palantir-technologies', BBAI:'bigbear-ai', GFAI:'guardforce-ai',
  IREN:'iris-energy', APLD:'applied-digital',
  // ETF
  SPY:'spdr-sp-500-etf-trust', QQQ:'invesco-qqq-trust',
  VOO:'vanguard-sp-500-etf', VTI:'vanguard-total-stock-market-etf',
  IWM:'ishares-russell-2000-etf', GLD:'spdr-gold-shares',
  SLV:'ishares-silver-trust', TLT:'ishares-20-year-treasury-bond-etf',
  HYG:'ishares-iboxx-high-yield-corporate-bond-etf',
  ARKK:'ark-innovation-etf', ARKG:'ark-genomic-revolution-etf',
  DIVO:'amplify-cwr-us-dividend', QQQI:'neos-nasdaq-100-high-income',
  JEPI:'jpmorgan-equity-premium-income-etf',
  JEPQ:'jpmorgan-nasdaq-equity-premium-income-etf',
  SCHD:'schwab-us-dividend-equity-etf', VYM:'vanguard-high-dividend-yield-etf',
  QYLD:'global-x-nasdaq-100-covered-call-etf',
  RYLD:'global-x-russell-2000-covered-call-etf',
  // 한국 상장 미국주식 관련 추가
  ZETA:'zeta-global', SMCI:'super-micro-computer',
  // 기타 인기 성장주
  CELH:'celsius-holdings', DUOL:'duolingo', TASK:'taskus',
  DOCS:'doximity', ACMR:'acm-research', WOLF:'wolfspeed',
  ENPH:'enphase-energy', SEDG:'solaredge-technologies',
  FSLR:'first-solar', RUN:'sunrun', NOVA:'sunnova-energy-international',
  STEM:'stem', BE:'bloom-energy', PLUG:'plug-power', BLDP:'ballard-power-systems',
  NKLA:'nikola', HYLN:'hyliion-holdings', WKHS:'workhorse-group',
  GOEV:'canoo', FSR:'fisker', MVST:'microvast-holdings',
  OPEN:'opendoor-technologies', OPAD:'offerpad-solutions',
  LMND:'lemonade', ROOT:'root', HIPO:'hippo-holdings',
  PROG:'progenics-pharmaceuticals', SEER:'seer', RXRX:'recursion-pharmaceuticals',
  PHAT:'phathom-pharmaceuticals', ACAD:'acadia-pharmaceuticals',
  SAGE:'sage-therapeutics', SRPT:'sarepta-therapeutics',
  EDIT:'editas-medicine', NTLA:'intellia-therapeutics',
  BEAM:'beam-therapeutics', CRSP:'crispr-therapeutics',
};

export default async function handler(req, res) {
  const ticker = (req.query.ticker || '').toUpperCase().trim();
  if (!ticker) return res.status(400).send('no ticker');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  const tvName = TV_MAP[ticker];
  const urls = [
    tvName && `https://s3-symbol-logo.tradingview.com/${tvName}--big.svg`,
    tvName && `https://s3-symbol-logo.tradingview.com/${tvName}.svg`,
    `https://financialmodelingprep.com/image-stock/${ticker}.png`,
    `https://eodhd.com/img/logos/US/${ticker.toLowerCase()}.png`,
  ].filter(Boolean);

  for (const url of urls) {
    try {
      const r = await fetch(url, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!r.ok) continue;
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('image') && !ct.includes('svg')) continue;
      const buf = await r.arrayBuffer();
      res.setHeader('Content-Type', ct);
      return res.status(200).send(Buffer.from(buf));
    } catch {}
  }

  // SVG 텍스트 fallback
  const COLORS = ['#007aff','#ff3b30','#ff9500','#34c759','#af52de','#5856d6','#ff2d55','#00c7be'];
  let h = 0;
  for (let i = 0; i < ticker.length; i++) h = (h * 31 + ticker.charCodeAt(i)) % COLORS.length;
  const color = COLORS[h];
  const text = ticker.slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="${color}"/><text x="40" y="40" dominant-baseline="central" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="${text.length===1?32:24}" fill="white">${text}</text></svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.status(200).send(svg);
}
