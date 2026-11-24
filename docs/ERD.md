# SpendWise 데이터베이스 ERD (Entity Relationship Diagram)

SpendWise(스펜드와이즈)는 개인의 실제 금융 소비 데이터를 정밀하게 기록하고, 수학적 분석 알고리즘을 통해 소비 습관을 점수화(100점 만점)하여 진단 및 예산 관리를 제공하는 핀테크 웹 애플리케이션입니다.

---

## 1. 개체-관계 다이어그램 (ERD)

```mermaid
erDiagram
    users ||--o{ categories : "creates custom"
    users ||--o{ transactions : "records"
    users ||--o{ budgets : "sets"
    users ||--o{ analysis_reports : "receives"
    users ||--o{ saving_goals : "manages"
    categories ||--o{ transactions : "classifies"
    categories ||--o{ budgets : "applies to"

    users {
        int id PK "회원 고유번호 (AUTO_INCREMENT)"
        varchar(100) email UK "로그인 이메일 (UNIQUE)"
        varchar(255) password "bcrypt 해시 암호문"
        varchar(50) name "회원 성명/닉네임"
        decimal(12,2) monthly_income_target "월 목표 소득"
        decimal(12,2) overspending_threshold "과소비 기준 금액 (단일 지출)"
        decimal(12,2) micro_tx_threshold "소액결제 기준 금액"
        datetime created_at "계정 생성일시"
        datetime updated_at "수정일시"
    }

    categories {
        int id PK "카테고리 고유번호"
        int user_id FK "소유 회원 (NULL=공통 시스템 카테고리)"
        varchar(50) name "카테고리 명칭 (예: 식비, 카페)"
        enum type "구분 (income, expense)"
        varchar(50) icon "아이콘 식별자"
        varchar(20) color "대표 HEX 색상코드"
        tinyint is_system "시스템 기본 제공 여부 (1/0)"
        datetime created_at "생성일시"
    }

    transactions {
        int id PK "거래 고유번호"
        int user_id FK "회원 ID"
        int category_id FK "카테고리 ID"
        enum type "수입/지출 구분 (income, expense)"
        decimal(12,2) amount "거래 금액"
        varchar(100) title "거래명 / 가맹점명"
        text description "상세 메모"
        date transaction_date "거래 일자"
        varchar(50) payment_method "결제 수단 (신용카드, 현금 등)"
        tinyint is_fixed "고정 수입/지출 여부 (1/0)"
        datetime created_at "등록일시"
        datetime updated_at "수정일시"
    }

    budgets {
        int id PK "예산 설정 고유번호"
        int user_id FK "회원 ID"
        int category_id FK "카테고리 ID (NULL=월 전체 총예산)"
        varchar(7) year_month "적용 연월 (YYYY-MM)"
        decimal(12,2) amount "설정 예산 한도액"
        datetime created_at "등록일시"
        datetime updated_at "수정일시"
    }

    analysis_reports {
        int id PK "분석 리포트 고유번호"
        int user_id FK "회원 ID"
        varchar(7) year_month UK "분석 연월 (YYYY-MM)"
        int habit_score "소비습관 종합 점수 (0-100)"
        varchar(20) grade "평가 등급 (최우수/우수/양호/주의/위험)"
        decimal(12,2) total_income "월 총 수입"
        decimal(12,2) total_expense "월 총 지출"
        decimal(12,2) net_savings "월 순 저축액 (수입 - 지출)"
        decimal(12,2) expected_month_end_expense "월말 예상 지출액"
        decimal(6,2) budget_usage_rate "예산 소진율 (%)"
        int overspending_count "과소비 건수"
        decimal(12,2) overspending_total "과소비 총액"
        int micro_transaction_count "반복 소액결제 건수"
        decimal(12,2) micro_transaction_total "반복 소액결제 총액"
        json score_breakdown "세부 항목별 채점 근거 JSON"
        text feedback_summary "종합 진단 총평 및 개선 가이드"
        datetime created_at "리포트 생성일시"
        datetime updated_at "최종 갱신일시"
    }

    saving_goals {
        int id PK "목표 고유번호"
        int user_id FK "회원 ID"
        varchar(100) title "챌린지/목표 명칭"
        decimal(12,2) target_amount "목표 금액"
        decimal(12,2) current_amount "현재 달성/절약 금액"
        date start_date "시작일"
        date end_date "종료일"
        varchar(50) category "목표 분류 (비상금, 여행, 절감 등)"
        enum status "상태 (ongoing, completed, failed)"
        varchar(50) icon "아이콘 식별자"
        datetime created_at "등록일시"
        datetime updated_at "수정일시"
    }
```

---

## 2. 테이블 정의서 및 관계 상세

### 1) users (회원)
- **설명**: 회원 인증 정보 및 회원별 분석 임계치 설정.
- **주요 제약조건**:
  - `email`: UNIQUE 인덱스
  - `password`: bcrypt 해시 문자열 저장 (평문 저장 금지)

### 2) categories (수입/지출 카테고리)
- **설명**: 수입 및 지출 항목 분류.
- **주요 제약조건**:
  - `user_id`: NULL 허용. `NULL`인 레코드는 전체 사용자가 공통으로 사용하는 시스템 기본 카테고리이며, 사용자 정의 카테고리는 해당 회원의 `user_id`를 참조.
  - 외래키 `fk_categories_user`: `ON DELETE CASCADE`

### 3) transactions (수입·지출 거래 내역)
- **설명**: 사용자의 실제 수입 및 지출 거래 원장.
- **주요 제약조건**:
  - 외래키 `fk_transactions_user`: `ON DELETE CASCADE`
  - 외래키 `fk_transactions_category`: `ON DELETE RESTRICT` (사용 중인 카테고리 임의 삭제 방지)
  - 복합 인덱스 `idx_transactions_user_date` (`user_id`, `transaction_date`): 월별/기간별 빠른 조회를 위한 최적화
  - 복합 인덱스 `idx_transactions_user_cat` (`user_id`, `category_id`): 카테고리별 합산 쿼리 가속

### 4) budgets (월별/카테고리별 예산)
- **설명**: 해당 연월(YYYY-MM)의 전체 예산 및 카테고리별 개별 예산 한도.
- **주요 제약조건**:
  - `category_id`: `NULL`일 경우 해당 월의 **전체 통합 지출 예산**을 의미함.
  - 고유키 `uq_budget_user_cat_month` (`user_id`, `category_id`, `year_month`): 동일 월, 동일 카테고리에 대한 중복 예산 등록 방지 (UPSERT 대응)

### 5) analysis_reports (소비 습관 진단 및 월간 분석 리포트)
- **설명**: 사용자의 실제 거래 내역을 기반으로 산출된 100점 만점 소비습관 점수 및 지표 저장.
- **주요 제약조건**:
  - 고유키 `uq_analysis_user_month` (`user_id`, `year_month`): 사용자별 월당 1건의 분석 리포트 보장
  - `score_breakdown`: JSON 포맷으로 예산 준수도, 저축률, 과소비 억제율, 소액결제 빈도 4대 평가 영역별 세부 점수와 산출 공식을 영구 보존

### 6) saving_goals (절약 목표 및 챌린지)
- **설명**: 사용자가 주도적으로 설정한 금융 목표 및 소비 절감 챌린지.
- **주요 제약조건**:
  - 외래키 `fk_goals_user`: `ON DELETE CASCADE`
  - 복합 인덱스 `idx_saving_goals_user_status` (`user_id`, `status`): 진행 중인 챌린지 즉시 필터링
