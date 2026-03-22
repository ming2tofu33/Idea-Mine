---
title: Tech Stack
tags:
  - implementation
---

# Tech Stack

> Expo + Supabase 기반 크로스 플랫폼 아키텍처.

---

## 스택 구성

| 영역 | 선택 | 역할 |
|------|------|------|
| Frontend | Expo (React Native) | 모바일(iOS/Android) + 웹 단일 코드베이스 |
| Router | Expo Router | 파일 기반 라우팅 (Next.js와 유사) |
| Backend | Supabase | Auth, PostgreSQL DB, Storage |
| Backend 로직 | Python | 비즈니스 로직, AI 파이프라인 |
| AI Engine | OpenAI API | 아이디어 원석 생성, 프로젝트 개요 생성 |
| 모바일 결제 | RevenueCat | Apple IAP + Google Play Billing 래퍼 |
| 웹 결제 | Polar.sh | MoR(Merchant of Record), 세금/VAT 대행 |
| Ads | Google AdMob | 보상형 광고 |
| Push | Expo Notifications | 네이티브 푸시 알림 |
| Build | EAS Build | 클라우드 빌드 (Windows에서도 iOS 빌드 가능) |
| MCP 서버 | Python + FastMCP | 백엔드 API 위 얇은 래퍼. 획득 채널 |
| Domain | ideamineai.com | 웹 배포 + 랜딩 |

---

## 플랫폼 분기 전략

UI와 비즈니스 로직은 100% 공유, 플랫폼 의존 기능만 분기:

| 기능 | 모바일 | 웹 | MCP |
|------|--------|-----|-----|
| 결제 | RevenueCat | Polar.sh | 없음 (무료만) |
| 광고 | AdMob | AdSense | 없음 |
| 푸시 | Expo Notifications | Web Push API | 없음 |
| UI | 자동 변환 | react-native-web | 텍스트 (AI 어시스턴트) |
| 저장 | Supabase | Supabase | 불가 (휘발성) |

### MCP 아키텍처

```
[AI 어시스턴트] → [MCP 서버 (FastMCP)] → [백엔드 API] → [OpenAI/Supabase]
```

- MCP에 비즈니스 로직 0줄. API 호출 + 포맷 변환만.
- 앱/웹/MCP가 같은 백엔드 API를 호출. 로직 중복 없음.
- API `source` 태그로 비용 분리 추적 (`app` | `web` | `mcp`).
- 상세: `plans/2026-03-22-mcp-server-spec.md`

---

## 개발 환경

- OS: Windows 11
- 테스트: Expo Go (폰 QR 스캔) + 웹 브라우저 + Android 에뮬레이터
- 빌드: EAS Build (클라우드)
- 개발 도구: Claude Code
- 개발자 배경: Python + Supabase 경험 있음, React/프론트엔드는 처음

---

## Related

- [[Phase-1-MVP]] — MVP 범위
- [[Security-Policy]] — API 키 보호, RLS 등 아키텍처 보안 (04-Features)

## See Also

- [[Project-Vision]] — 기술 선택 이유 (01-Core)
- `2026-03-22-abuse-prevention-design` -- rate limiting 미들웨어 + ai_usage_logs 테이블 설계 (09-Implementation/plans)
