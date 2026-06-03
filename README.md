# Stock Dashboard v2.0

실시간 미국 주식 포트폴리오 대시보드 (React + Vite + Vercel Serverless).

## 주요 변경 (v1 → v2)

### 버그 수정
- WebSocket이 holdings 변경마다 재연결되던 문제 → 티커 목록 기준으로만 재연결
- Supabase 저장 폭주 → 1초 디바운스 + AbortController
- 앱 로드 시 환율 1350 고정 → 마운트 시 즉시 조회 + 60초 갱신
- WebSocket 끊김 시 가격 멈춤 → 지수 백오프 자동 재연결 + 보조 폴링
- PIN UI 부재 → 자동 UUID 키 생성 (crypto.randomUUID)

### 성능
- stats/totals/pieData/dist → useMemo 캐싱 (틱마다 재계산 제거)
- HeaderBannerFx 등 컴포넌트를 App 외부로 분리 (재마운트 제거)
- 모달 미리보기 useMemo 적용

### 보안
- 하드코딩된 Supabase/Finnhub 키 제거 → 환경변수(.env)
- prices API 입력 검증(정규식), 티커 수 상한, 동시성 제한

### 디자인
- 라이트/다크 모드 자동 대응 (prefers-color-scheme)
- Manrope + Roboto Mono, 글래스모피즘 네비, color-mix 기반 시맨틱 컬러
- 하드코딩 색상 → CSS 변수

## 설정

```bash
npm install
cp .env.example .env   # 키 입력 (선택 — 비워도 동작)
npm run dev
```

환경변수가 없어도 동작합니다:
- Supabase 미설정 → localStorage만 사용
- Finnhub 미설정 → 정규장에도 Yahoo 폴링 사용

## Supabase RLS (필수)

`portfolios` 테이블에 user_key 기반 Row Level Security 정책을 설정하세요.
anon key는 공개되므로 RLS 없이는 타인 데이터 접근이 가능합니다.
