# IGRUS 가입 신청 폼 (임시)

메인 사이트 장애 시 사용하는 독립 실행형 가입 신청 폼.
기존 회원가입 페이지 디자인을 그대로 따르되, 계정/비밀번호/이메일 인증 없이
제출 데이터를 Google 스프레드시트에 쌓는다.

## 1. 스프레드시트 연결 (최초 1회)

1. 새 구글 스프레드시트 생성
2. 확장 프로그램 → Apps Script → `apps-script/Code.gs` 내용 붙여넣기
3. 배포 → 새 배포 → **웹 앱** (실행: 나 / 액세스: 모든 사용자)
4. 발급된 URL을 `.env`에 설정:

```bash
cp .env.example .env
# VITE_GAS_URL=발급받은_웹앱_URL
```

## 2. 로컬 실행

```bash
pnpm install
pnpm dev
```

## 3. 배포

정적 사이트라 아무 데나 올리면 된다 (Vercel/Netlify/S3 등):

```bash
pnpm build   # dist/ 생성
```

Vercel 기준: `npx vercel --prod` (환경변수 VITE_GAS_URL 설정 필요 — 빌드 시점에 주입됨)
