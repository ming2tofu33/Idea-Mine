# IDEA MINE v2 Note: V3까지 고려한 안전장치

> 이 문서는 IDEA MINE v2를 설계하고 구현할 때, 나중에 v3로 확장해도 구조가 무너지지 않도록 지켜야 할 안전장치를 정리한 노트다. 목적은 "미리 모든 것을 만들기"가 아니라 "지금의 결정이 미래를 막지 않게 만들기"다.

## 1. 이 문서가 필요한 이유

v2는 단순한 기능 추가 버전이 아니라, 제품 구조와 DB 구조를 다시 세우는 버전이다. 이 시점의 설계는 앞으로의 개발 속도뿐 아니라, v3에서 어떤 기능을 자연스럽게 확장할 수 있는지도 결정한다.

지금 중요한 것은 거대한 미래 설계를 다 해두는 것이 아니다. 오히려 반대다. 지금은 핵심 루프를 단단하게 만들고, 나중에 바뀔 가능성이 큰 부분은 느슨하게 두고, 절대 흔들리면 안 되는 부분만 강하게 고정해야 한다.

이 문서에서 말하는 "안전장치"는 그 기준이다.

## 2. v2의 기본 전제

IDEA MINE v2의 핵심 루프는 아래와 같다.

1. 유저가 들어온다.
2. 오늘의 상태를 확인한다.
3. 광맥을 만든다.
4. 아이디어를 생성한다.
5. 개요를 만든다.
6. 평가를 만든다.
7. 필요한 경우 풀 개요를 만든다.
8. 결과를 저장하고 다시 활용한다.

DB로 보면 이 흐름은 대체로 아래 순서로 이어진다.

- `profiles`
- `user_daily_state`
- `active_seasons`
- `veins`
- `ideas`
- `overviews`
- `appraisals`
- `full_overviews`
- `ai_usage_logs`

v3까지 가도 이 "흐름의 뼈대"는 유지되는 편이 좋다. 새로운 기능은 이 흐름 위에 올라가야지, 이 흐름을 매번 다시 뒤엎는 방식으로 붙으면 안 된다.

## 3. 가장 중요한 원칙

### 3.1 테이블은 단계별 책임을 가져야 한다

각 테이블은 제품 루프의 한 단계만 대표해야 한다.

- `ideas`는 아이디어 원본이어야 한다.
- `overviews`는 개요 결과여야 한다.
- `appraisals`는 평가 결과여야 한다.
- `full_overviews`는 긴 문서 결과여야 한다.

한 테이블이 여러 단계의 역할을 동시에 갖기 시작하면, 나중에 특정 단계만 개선하거나 교체하기 어려워진다.

### 3.2 사용자 상태와 콘텐츠는 분리해야 한다

`profiles`, `user_daily_state` 같은 사용자 운영 정보와, `ideas`, `overviews` 같은 콘텐츠 정보는 섞이면 안 된다.

이 분리가 지켜져야:

- 과금 정책 변경
- 권한 실험
- 일일 제한 변경
- 저장 구조 변경

같은 운영 변화가 콘텐츠 구조를 덜 흔든다.

### 3.3 원본과 파생 결과를 구분해야 한다

`veins`와 `ideas`는 비교적 원본에 가깝고, `overviews`, `appraisals`, `full_overviews`는 파생 결과다.

이 구분이 중요하다. 나중에 LLM 프롬프트나 모델을 바꿔도 원본을 다시 활용해 새로운 파생 결과를 만들 수 있기 때문이다.

## 4. DB 설계에서 반드시 지켜야 할 안전장치

### 4.1 마이그레이션은 V2 체인만 활성화한다

v1 timestamp migration과 v2 ordered migration을 같은 active 경로에서 같이 돌리면 안 된다.

원칙:

- `supabase/migrations`에는 active v2 chain만 둔다.
- v1은 archive로 분리한다.
- 이미 적용된 migration은 수정하지 않고 새 migration을 추가한다.
- migration 번호는 중복 없이 단조 증가한다.

이 원칙이 깨지면 스키마 드리프트가 다시 시작된다.

### 4.2 코드가 기대하는 컬럼명과 migration 정의를 절대 분리하지 않는다

v1에서 가장 컸던 문제는 코드와 DB 정의가 따로 놀았다는 점이다.

예:

- migration은 `title`, `summary`를 정의했는데
- 런타임은 `title_ko`, `title_en`, `summary_ko`, `summary_en`을 사용했다

v2에서는 이런 일이 다시 생기면 안 된다.

원칙:

- 코드에서 쓰는 컬럼이 바뀌면 migration도 같이 바뀌어야 한다.
- DB를 dashboard에서 수동 수정하지 않는다.
- remote DB가 source of truth가 아니라 repo migration이 source of truth여야 한다.

### 4.3 JSONB는 문서형 블록에만 사용한다

JSONB는 강력하지만, 너무 많이 쓰면 나중에 쿼리와 인덱스가 복잡해진다.

권장:

- `full_overviews`처럼 길고 구조적인 문서 블록에는 `jsonb` 사용 가능
- 자주 필터링하거나 정렬하는 값은 일반 컬럼으로 유지

쉽게 말하면:

- "읽기용 덩어리"는 `jsonb`
- "검색/정렬/집계 기준"은 컬럼

### 4.4 FK와 hot path 인덱스를 초기에 맞춘다

v3에서 데이터가 쌓이면 느려지는 지점은 거의 정해져 있다.

주로:

- `user_id`
- `idea_id`
- `overview_id`
- `created_at`
- `is_active`

같은 컬럼 조합이다.

원칙:

- FK에는 기본적으로 인덱스를 고려한다.
- `where + order by` 패턴은 composite index로 맞춘다.
- active/history 모델은 partial index를 적극 사용한다.

예:

- `veins (user_id, date, slot_index) where is_active = true`
- `overviews (user_id, created_at desc)`
- `appraisals (overview_id, created_at desc)`

### 4.5 RLS는 늦게 덕지덕지 붙이지 않는다

RLS는 보안 기능이기도 하지만 설계 기능이기도 하다.

원칙:

- user-owned table은 기본적으로 RLS를 켠다.
- 정책은 `(select auth.uid()) = user_id` 또는 그에 준하는 명확한 형태로 쓴다.
- admin 예외는 policy 우회보다는 별도 RPC 또는 service-role 경로로 분리한다.

이렇게 해야 나중에 팀 기능, 공유 기능, 공개 자산 같은 걸 붙일 때 정책을 재구성하기 쉽다.

## 5. API와 앱 구조에서의 안전장치

### 5.1 Supabase direct read와 backend API의 경계를 정한다

v2에서 이 부분을 애매하게 두면 v3에서 반드시 꼬인다.

원칙:

- 단순 조회는 direct read를 허용할 수 있다.
- 상태 변화, 권한 판정, 생성 파이프라인은 backend API를 통과시킨다.

예:

- `profiles` 조회: direct read 가능
- `ideas` 생성: backend API
- `overviews` 생성: backend API
- admin action: backend API 또는 RPC

한 문장으로 말하면, "읽기"와 "행동"을 구분해야 한다.

### 5.2 생성 파이프라인은 단계별 서비스로 분리한다

아이디어 생성, 개요 생성, 평가 생성, 풀 개요 생성은 각각 독립 서비스여야 한다.

이렇게 해야 나중에:

- 특정 단계만 새 모델로 교체
- 특정 단계만 비동기 큐로 전환
- 특정 단계만 유료화

같은 변화가 쉬워진다.

### 5.3 API 응답은 DB 구조를 그대로 노출하지 않는다

초기에는 DB 컬럼을 그대로 프론트에 내보내고 싶어지지만, 이 방식은 v3 확장에 약하다.

원칙:

- API contract는 제품 개념 중심으로 둔다.
- DB는 저장 구조이고, API는 사용 구조다.

예를 들어 DB 컬럼이 바뀌어도 API shape를 유지할 수 있어야 한다.

## 6. 제품 확장 관점의 안전장치

### 6.1 "history를 남기는 구조"를 기본값으로 둔다

v3에서 자주 생기는 요구는 대부분 "이전 것도 보고 싶다"로 온다.

예:

- reroll 이력
- 평가 버전 이력
- 개요서 재생성 이력
- 실험별 결과 비교

처음부터 모든 걸 version table로 만들 필요는 없다. 하지만 최소한 "덮어쓰기만 하는 구조"는 피하는 편이 좋다.

권장:

- `appraisals`는 히스토리형 유지
- `veins`는 active/history 모델 유지
- `full_overviews`는 나중에 버전 테이블로 확장 가능하게 설계

### 6.2 등급, 시즌, 실험은 본문 데이터에 박지 않는다

티어 정책, 시즌 이벤트, 실험 플래그는 시간이 지나며 자주 바뀐다. 이런 값을 콘텐츠 본문에 강하게 박아 넣으면 나중에 해석이 복잡해진다.

원칙:

- 정책성 데이터는 별도 상태 테이블이나 로그로 분리
- 결과물에는 필요한 최소 메타데이터만 저장

### 6.3 LLM 결과물에는 "생성 맥락"을 남길 준비를 한다

v3에서는 거의 반드시 이런 질문이 나온다.

- 이 결과는 어떤 모델로 만들었지?
- 어떤 프롬프트 버전이었지?
- 왜 예전 결과와 다르지?

v2에서 전부 구현하지 않아도 되지만, 최소한 나중에 붙일 자리를 남겨야 한다.

권장 확장 포인트:

- `model_name`
- `prompt_version`
- `generation_version`
- `source_keywords`

초기에는 `ai_usage_logs`에 두고, 필요하면 나중에 각 결과 테이블로 일부 승격시킬 수 있다.

## 7. 운영과 분석을 위한 안전장치

### 7.1 AI 사용 로그는 비용 추적용이 아니라 제품 학습용이기도 하다

`ai_usage_logs`는 단순 비용 테이블이 아니다.

나중에 여기서 보고 싶은 것은:

- 어느 단계가 가장 많이 쓰이는지
- 어느 티어에서 비용이 튀는지
- 어느 흐름에서 중도 이탈이 많은지
- 어떤 생성 단계가 재시도를 많이 부르는지

즉, v3의 개선 힌트는 대개 로그에서 나온다.

### 7.2 "운영자용 예외 경로"는 일반 유저 경로와 분리한다

admin 기능을 일반 유저 경로에 섞어 넣으면 정책이 금방 더러워진다.

원칙:

- admin action은 RPC 또는 별도 router로 분리
- admin persona 전환도 명시적 경로로 유지
- admin 여부 판정은 항상 caller 기준으로 한다

## 8. v3에서 자연스럽게 붙일 수 있는 확장 예시

현재 v2 구조를 잘 지키면, 아래 기능은 비교적 자연스럽게 붙는다.

- 팀/워크스페이스 기능
- idea collection / folder / tag
- overview versioning
- appraisal rubric 다양화
- public showcase
- saved prompt strategy
- personalized mining bias
- recommendation system
- async generation queue
- observatory analytics

이 기능들이 가능한 이유는, 지금 구조가 "한 테이블에 모든 것을 몰아넣는 구조"가 아니라 "단계별 산출물과 사용자 상태를 분리하는 구조"이기 때문이다.

## 9. 반대로, 이 신호가 보이면 구조가 망가지고 있다는 뜻이다

아래 신호는 v3 이전에 반드시 경고로 봐야 한다.

1. `profiles`에 앱 설정, 실험 상태, UI state, 임시 플래그가 계속 쌓이기 시작한다.
2. `ideas`에 overview 성격의 컬럼이 들어가기 시작한다.
3. `overviews`에 appraisal 결과를 직접 덮어쓰기 시작한다.
4. 자주 조회하는 값을 `jsonb` 안에만 넣기 시작한다.
5. 모바일 direct query와 backend API가 같은 데이터를 서로 다른 규칙으로 수정한다.
6. dashboard에서 수동으로 DB를 고치기 시작한다.
7. migration을 수정해서 과거를 덮어쓴다.
8. "일단 빨리 하자"는 이유로 RLS를 미루고 service key 경로만 늘어난다.

이 신호들이 쌓이면 v3는 확장이 아니라 재구축이 된다.

## 10. 결론

v2는 지금 "미래를 다 구현한 구조"가 아니라, "미래를 막지 않는 구조"여야 한다.

그 기준은 복잡한 추상화가 아니다. 아래 5가지를 지키면 된다.

1. 단계별 테이블 책임을 섞지 않는다.
2. migration을 repo 기준으로 엄격하게 관리한다.
3. 자주 조회하는 값은 컬럼으로, 문서형 블록만 `jsonb`로 둔다.
4. direct read와 backend action의 경계를 명확히 한다.
5. history, logs, policy 분리를 통해 나중에 실험과 확장을 가능하게 한다.

이 원칙만 지켜도 v2는 충분히 유연하고, v3는 "다시 만들기"보다 "확장하기"에 가까운 프로젝트가 될 가능성이 높다.
