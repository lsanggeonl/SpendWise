# 💎 SpendWise (스펜드와이즈)
### 개인 소비습관 정밀 분석 및 자산 관리 핀테크 웹 서비스

![Node.js](https://img.shields.io/badge/Node.js-v22.22.1-green)
![Express](https://img.shields.io/badge/Express-v5.3.0-blue)
![EJS](https://img.shields.io/badge/View-EJS-orange)
![MySQL](https://img.shields.io/badge/Database-MySQL2-blueviolet)
![Chart.js](https://img.shields.io/badge/Visualization-Chart.js-coral)
![Security](https://img.shields.io/badge/Auth-bcrypt%20%26%20Session-success)

---

## 1. 프로젝트 개요
**SpendWise**는 단순한 가계부 기록을 넘어, 사용자의 실제 거래 데이터를 수학적 통계 모델로 분석하여 **소비 습관 점수(100점 만점)**를 진단하고, **과소비 및 반복 소액결제(티끌 누수)를 정밀 탐지**하며, **월말 예상 지출**과 **단계별 예산 경고(70%·90%·100%)**를 제공하는 프리미엄 핀테크 대시보드 웹 애플리케이션입니다.

임의의 난수나 가짜 통계를 일절 배제하고, **100% 실제 MySQL 데이터**를 기반으로 실시간 집계 및 분석 알고리즘이 작동합니다.

---

## 2. 필수 기술 스택 준수 현황
본 프로젝트는 요구사항에 명시된 필수 기술 스택만을 엄격히 사용하여 구현되었습니다 (React, Vue 등 프론트엔드 프레임워크 미사용).

| 기술 구분 | 적용 기술 | 세부 버전 및 역할 |
|---|---|---|
| **런타임** | **Node.js** | v22.22.1 LTS 기반 비동기 I/O 런타임 |
| **웹 프레임워크** | **Express** | v5.3.0 엔터프라이즈 RESTful MVC 라우팅 |
| **템플릿 엔진** | **EJS** | v7.0.2 서버 사이드 렌더링 (SSR) 컴포넌트화 |
| **데이터베이스** | **MySQL (MariaDB)** | 11.8.6 정규화 관계형 DB 엔진 |
| **DB 드라이버** | **MySQL2** | v3.24.6 Promise 기반 커넥션 풀 & Prepared Statements |
| **데이터 시각화** | **Chart.js** | v4.6.2 반응형 다크모드 차트 (Bar, Doughnut, Radar) |
| **보안/인증** | **bcrypt** | v6.0.0 단방향 솔팅 해시 알고리즘 (비밀번호 암호화) |
| **세션 관리** | **express-session** | v1.19.0 HTTP-Only 쿠키 세션 인증 및 경로 보호 |
| **환경설정** | **dotenv** | v18.0.10 환경변수 (.env) 격리 및 보안 관리 |

---

## 3. 핵심 기능 목록

### ① 수입 및 지출 등록·수정·삭제 (CRUD)
- 수입/지출 구분, 금액, 일자, 카테고리, 가맹점/거래명, 결제수단, 고정비 여부, 상세 메모 완벽 지원
- 연월(YYYY-MM), 거래 구분(수입/지출), 카테고리, 검색어 기반의 고속 필터링 및 페이징 처리

### ② 월별 수입·지출 통계 대시보드
- 당월 총 수입, 총 지출, 순 저축액(수입 - 지출), 월말 예상 지출 4대 지표 카드
- 최근 6개월간의 수입 vs 지출 비교 막대 차트 (Chart.js)
- 최근 발생한 거래 원장 내역 실시간 표시

### ③ 카테고리별 소비 분석 및 차트
- 당월 지출 금액 상위 카테고리별 비중 도넛 차트 (Chart.js Doughnut)
- 카테고리별 대표 색상 및 아이콘 매핑

### ④ 월별 및 카테고리별 예산 설정
- 당월 전체 총 지출 예산 한도 설정
- 식비, 카페/간식, 주거/통신, 쇼핑 등 카테고리별 세부 예산 독립 설정
- 예산 대비 실제 지출액, 잔여 금액, 실시간 사용률(%) 계산

### ⑤ 예산 사용률 70%, 90%, 100% 단계별 경고 시스템
- **안정 (< 70%)**: 녹색 배지 (`안정적으로 소비 통제 중`)
- **주의 단계 (70% ~ 90%)**: 노란색 경고 배너 (`70% 소진, 지출 속도 조절 권장`)
- **경고 단계 (90% ~ 100%)**: 주황색 긴급 배너 (`90% 도달, 필수 지출 외 결제 자제`)
- **초과 위험 (≥ 100%)**: 적색 위험 배너 (`예산 초과 발생, 즉각적인 지출 차단 필요`)

### ⑥ 수학적 통계 기반 월말 예상 지출 계산
- 현재 경과 일수($D$)와 월 총 일수($T$), 누적 지출액($E$)을 기반으로 일평균 소비 추세를 수학적으로 외삽:
  $$\text{Daily Average} = \frac{E}{D}, \quad \text{Expected Month-End Expense} = E + \left(\text{Daily Average} \times (T - D)\right)$$
- 임의 통계가 아닌 실제 거래 날짜와 일수를 바탕으로 정확히 산출

### ⑦ 100점 만점 소비습관 점수 및 평가 근거
- 실제 MySQL 데이터를 기반으로 4대 핵심 재무 지표를 채점:
  1. **예산 준수도 (35점 만점)**: 예산 소진율에 따른 감점/가점 모델
  2. **저축/잉여율 (25점 만점)**: 소득 대비 저축률(%) 비례 채점
  3. **과소비 억제도 (20점 만점)**: 단일 결제 임계치 초과 건수 통제력
  4. **반복 소액결제 관리도 (20점 만점)**: 잦은 소액(티끌) 결제 빈도 억제율
- **등급 판정**: 최우수(S, 90~100점), 우수(A, 80~89점), 양호(B, 70~79점), 주의(C, 60~69점), 위험(D, 60점 미만)
- 각 항목별 세부 득점과 평가 근거, 맞춤형 금융 코칭 피드백 제공

### ⑧ 과소비 및 반복 소액 결제 탐지 리포트
- **과소비 탐지**: 사용자 설정 기준(기본: 100,000원) 이상의 고액 단일 지출을 필터링하여 총액 및 전체 지출 내 비중 경고
- **반복 소액 결제 탐지**: 사용자 설정 기준(기본: 10,000원) 이하의 카페, 편의점, 배달팁 등 잦은 지출을 가맹점/항목별로 그룹화하여 누적 횟수 및 낭비 총액 산출

### ⑨ 절약 목표 및 챌린지 관리
- '비상금 모으기', '카페 음료 줄이기' 등 목표 금액, 기간, 진행 상태 관리
- '절약/저축 금액 추가' 원클릭 액션을 통해 실시간 달성률(%) 및 잔여 일수(D-day) 갱신

---

## 4. 데이터베이스 구조 (Database Schema)

SpendWise 전용 격리 데이터베이스인 `spendwise_db`를 사용하며, 기존 EC2의 `webdb` 데이터와 충돌하지 않도록 완벽히 분리 설계되었습니다.

- **`users`**: 회원 인증(bcrypt 암호화), 프로필, 맞춤 분석 임계치 설정
- **`categories`**: 공통 시스템 카테고리 및 사용자 정의 카테고리
- **`transactions`**: 수입·지출 실제 금융 거래 원장 (복합 인덱스 적용)
- **`budgets`**: 월 전체 및 카테고리별 예산 한도 (연월+카테고리 UNIQUE 제약)
- **`analysis_reports`**: 산출된 소비습관 점수, 4대 평가 JSON, 예상 지출액 캐싱
- **`saving_goals`**: 절약 챌린지 목표 금액 및 현재 달성액 트래킹

> 상세 ERD 및 스키마 명세는 [docs/ERD.md](file:///home/ubuntu/gimal/docs/ERD.md)를 참조하십시오.

---

## 5. 프로젝트 디렉터리 구조

```text
/home/ubuntu/gimal/
├── .env                  # 환경 변수 설정 (DB 계정, 포트, 세션 시크릿)
├── .env.example          # 환경 변수 예시 파일
├── app.js                # Express 애플리케이션 진입점 및 미들웨어 파이프라인
├── package.json          # 프로젝트 의존성 및 실행 스크립트
├── config/
│   └── db.js             # MySQL2 Connection Pool 설정
├── database/
│   ├── schema.sql        # DDL 스키마 정의 (6개 테이블, 외래키, 인덱스)
│   └── seed.sql          # 기본 카테고리 및 현실적인 데모 데이터셋
├── docs/
│   └── ERD.md            # Mermaid 기반 Entity-Relationship Diagram
├── middlewares/
│   ├── auth.js           # 세션 인증 가드 및 템플릿 변수 주입
│   └── errorHandler.js   # 중앙 집중식 에러 핸들러
├── models/               # Prepared Statements 기반 데이터 모델
│   ├── User.js
│   ├── Category.js
│   ├── Transaction.js
│   ├── Budget.js
│   ├── Analysis.js
│   └── SavingGoal.js
├── services/             # 비즈니스 로직 및 수학적 분석 알고리즘
│   ├── authService.js
│   ├── transactionService.js
│   ├── budgetService.js
│   └── analysisService.js # 예상 지출, 100점 습관 점수, 과소비/소액 탐지 계산
├── controllers/          # 요청 처리 및 뷰 바인딩
│   ├── authController.js
│   ├── dashboardController.js
│   ├── transactionController.js
│   ├── budgetController.js
│   ├── analysisController.js
│   ├── challengeController.js
│   └── settingController.js
├── routes/               # RESTful 라우팅 모듈
│   ├── index.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── transactions.js
│   ├── budget.js
│   ├── analysis.js
│   ├── challenges.js
│   └── settings.js
├── public/
│   ├── css/
│   │   └── style.css     # 핀테크 스타일 세련된 다크모드 반응형 CSS
│   └── js/
│       ├── main.js       # 모바일 사이드바, 모달 다이얼로그 제어
│       ├── dashboard.js  # 대시보드 6개월 추이 및 카테고리 도넛 차트
│       └── analysis.js   # 4대 평가 영역 레이더 차트
└── views/                # EJS 뷰 템플릿
    ├── partials/         # 헤더, 사이드바, 알림 배너, 푸터 공통 템플릿
    ├── auth/             # 로그인 및 회원가입 화면
    ├── dashboard/        # 종합 금융 현황 대시보드
    ├── transactions/     # 수입·지출 원장 및 등록/수정 폼
    ├── budget/           # 예산 한도 설정 및 70/90/100% 경고 모니터링
    ├── analysis/         # 100점 습관 진단 및 소비 패턴 탐지 리포트
    ├── challenge/        # 절약 챌린지 및 달성률 트래킹
    ├── settings/         # 회원 프로필, 탐지 임계치, 비밀번호 변경
    └── error.ejs         # 다크모드 404/500 에러 페이지
```

---

## 6. 설치 및 실행 방법

### 1) 환경 변수 확인 (`.env`)
```bash
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=webuser
DB_PASSWORD=WebPassword!
DB_NAME=spendwise_db
DB_PORT=3306
DB_CONNECTION_LIMIT=10
SESSION_SECRET=spendwise_super_secret_fintech_session_key_2026
```

### 2) 데이터베이스 초기화 및 시드 데이터 적재
```bash
# 스키마 생성
npm run migrate

# 데모 데이터 적재 (데모 유저, 카테고리, 11월 거래 내역, 예산, 챌린지)
npm run seed
```

### 3) 단위 및 통합 테스트 실행 (22개 테스트)
```bash
npm test
```

### 4) 웹 애플리케이션 시작
```bash
npm start
# 또는 개발 모드 (watch)
npm run dev
```

서버 구동 후 웹 브라우저에서 `http://<EC2-IP>:3000` 또는 `http://localhost:3000`으로 접속합니다.

---

## 7. 데모 체험 계정

| 구분 | 계정 정보 |
|---|---|
| **이메일** | `demo@spendwise.com` |
| **비밀번호** | `password123` |
| **성명** | 김스펜드 |
| **월 목표 소득** | 3,800,000원 |
| **과소비 탐지 기준** | 단일 100,000원 이상 |
| **소액결제 탐지 기준** | 단일 10,000원 이하 |
