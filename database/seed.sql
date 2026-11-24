-- ========================================================
-- SpendWise Seed Data
-- ========================================================

USE `spendwise_db`;

-- Disable foreign key checks for clean seed
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `saving_goals`;
TRUNCATE TABLE `analysis_reports`;
TRUNCATE TABLE `budgets`;
TRUNCATE TABLE `transactions`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- 1. Users
-- Demo User: demo@spendwise.com / password123
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password`, `name`, `monthly_income_target`, `overspending_threshold`, `micro_tx_threshold`)
VALUES (
  1,
  'demo@spendwise.com',
  '$2b$10$vtEC.7n6VbKK2RuCLJyzKeTbvJ0nyg2LgvcFsls/BPum.IKL0s.g2',
  '김스펜드',
  3800000.00,
  100000.00,
  10000.00
);

-- --------------------------------------------------------
-- 2. System Default Categories
-- --------------------------------------------------------
-- Income Categories (1 ~ 5)
INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `icon`, `color`, `is_system`) VALUES
(1, NULL, '급여', 'income', 'briefcase', '#10B981', 1),
(2, NULL, '상여금', 'income', 'gift', '#059669', 1),
(3, NULL, '부업/사업', 'income', 'trending-up', '#34D399', 1),
(4, NULL, '금융/투자', 'income', 'dollar-sign', '#6EE7B7', 1),
(5, NULL, '기타 수입', 'income', 'plus-circle', '#A7F3D0', 1);

-- Expense Categories (6 ~ 15)
INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `icon`, `color`, `is_system`) VALUES
(6,  NULL, '식비/외식', 'expense', 'utensils', '#EF4444', 1),
(7,  NULL, '카페/간식', 'expense', 'coffee', '#F59E0B', 1),
(8,  NULL, '주거/통신', 'expense', 'home', '#3B82F6', 1),
(9,  NULL, '교통/차량', 'expense', 'truck', '#6366F1', 1),
(10, NULL, '쇼핑/생필품', 'expense', 'shopping-bag', '#EC4899', 1),
(11, NULL, '문화/여가', 'expense', 'film', '#8B5CF6', 1),
(12, NULL, '의료/건강', 'expense', 'activity', '#14B8A6', 1),
(13, NULL, '교육/학습', 'expense', 'book-open', '#06B6D4', 1),
(14, NULL, '경조사/선물', 'expense', 'heart', '#F43F5E', 1),
(15, NULL, '기타 지출', 'expense', 'more-horizontal', '#6B7280', 1);

-- --------------------------------------------------------
-- 3. Budgets for Demo User (2026-11)
-- --------------------------------------------------------
-- Overall monthly budget for 2026-11: 2,500,000 KRW (category_id = NULL)
INSERT INTO `budgets` (`user_id`, `category_id`, `year_month`, `amount`) VALUES
(1, NULL, '2026-11', 2500000.00),
(1, 6,    '2026-11', 700000.00),   -- 식비/외식
(1, 7,    '2026-11', 150000.00),   -- 카페/간식
(1, 8,    '2026-11', 750000.00),   -- 주거/통신
(1, 9,    '2026-11', 150000.00),   -- 교통/차량
(1, 10,   '2026-11', 400000.00),   -- 쇼핑/생필품
(1, 11,   '2026-11', 200000.00);   -- 문화/여가

-- Past Month Budget (2026-10)
INSERT INTO `budgets` (`user_id`, `category_id`, `year_month`, `amount`) VALUES
(1, NULL, '2026-10', 2500000.00);

-- --------------------------------------------------------
-- 4. Transactions for Demo User
-- Contains income, fixed expenses, daily dining, cafe micro-transactions, and overspending
-- --------------------------------------------------------
-- 2026-11 Income
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 1, 'income', 3800000.00, '11월 정기 급여', '테크 기업 본사 급여 입금', '2026-11-25', '계좌이체', 1),
(1, 3, 'income', 350000.00, '블로그 애드센스 정산', '구글 애드센스 11월 부수입', '2026-11-20', '계좌이체', 0);

-- 2026-11 Fixed Expenses
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 8, 'expense', 650000.00, '오피스텔 월세', '11월 주거 월세 납부', '2026-11-05', '계좌이체', 1),
(1, 8, 'expense', 85000.00, '통신비 (휴대폰+인터넷)', 'KT 결합상품 자동이체', '2026-11-10', '자동이체', 1),
(1, 11, 'expense', 17000.00, '넷플릭스 프리미엄 구독', '정기 디지털 구독료', '2026-11-03', '신용카드', 1);

-- 2026-11 Regular Dining & Living
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 6, 'expense', 14000.00, '점심 백반 정식', '직장 동료들과 점심식사', '2026-11-02', '신용카드', 0),
(1, 6, 'expense', 28000.00, '저녁 초밥 포장', '퇴근 후 저녁 식사', '2026-11-04', '신용카드', 0),
(1, 9, 'expense', 65000.00, '지하철/버스 후불교통비', '10월 후불 대중교통 정산', '2026-11-06', '체크카드', 0),
(1, 6, 'expense', 54000.00, '이마트 장보기', '주말 식재료 및 생수 구매', '2026-11-07', '신용카드', 0),
(1, 6, 'expense', 13500.00, '점심 쌀국수', '회사 근처 식사', '2026-11-09', '신용카드', 0),
(1, 6, 'expense', 32000.00, '배달 치킨 세트', '주말 저녁 배달 주문', '2026-11-13', '간편결제', 0),
(1, 6, 'expense', 45000.00, '삼겹살 회식 분담금', '부서 친목 저녁식사', '2026-11-17', '체크카드', 0),
(1, 12, 'expense', 12000.00, '치과 정기 검진', '스케일링 및 검진', '2026-11-18', '신용카드', 0),
(1, 6, 'expense', 15000.00, '점심 갈비탕', '따뜻한 점심식사', '2026-11-21', '신용카드', 0);

-- 2026-11 Overspending Transactions (>= 100,000 KRW)
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 10, 'expense', 260000.00, '겨울 패딩 점퍼 구매', '백화점 세일 코트 및 방한의류', '2026-11-14', '신용카드', 0),
(1, 6, 'expense', 185000.00, '친구 청첩장 모임 식사비', '주말 와인 다이닝 모임 결제', '2026-11-15', '신용카드', 0),
(1, 11, 'expense', 130000.00, '연말 콘서트 예매', '인터파크 티켓 예매', '2026-11-22', '신용카드', 0);

-- 2026-11 Repeated Micro-transactions (<= 10,000 KRW)
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 7, 'expense', 4500.00, '스타벅스 아메리카노', '출근길 모닝 커피', '2026-11-02', '간편결제', 0),
(1, 7, 'expense', 5200.00, '투썸플레이스 카페라떼', '점심 식후 테이크아웃', '2026-11-03', '간편결제', 0),
(1, 7, 'expense', 4800.00, '메가커피 음료 2잔', '동료 간식 구매', '2026-11-05', '체크카드', 0),
(1, 7, 'expense', 6000.00, '디저트 마카롱 2개', '퇴근길 간식', '2026-11-06', '체크카드', 0),
(1, 7, 'expense', 4500.00, '이디야 아이스 바닐라라떼', '오후 티타임', '2026-11-09', '신용카드', 0),
(1, 7, 'expense', 5500.00, '편의점 간식 및 샌드위치', 'GS25 야식 구매', '2026-11-10', '체크카드', 0),
(1, 7, 'expense', 4500.00, '스타벅스 아메리카노', '회의 전 음료 구매', '2026-11-12', '간편결제', 0),
(1, 7, 'expense', 3800.00, '컴포즈커피 돌체라떼', '점심 산책 간식', '2026-11-16', '간편결제', 0),
(1, 7, 'expense', 4500.00, '스타벅스 아메리카노', '월요병 극복 커피', '2026-11-19', '간편결제', 0),
(1, 7, 'expense', 6500.00, '베이커리 소금빵+커피', '주말 브런치 간식', '2026-11-21', '체크카드', 0),
(1, 7, 'expense', 4500.00, '스타벅스 아메리카노', '출근길 음료 테이크아웃', '2026-11-23', '간편결제', 0);

-- Past Month: 2026-10 Transactions
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 1, 'income', 3800000.00, '10월 정기 급여', '정기 월급', '2026-10-25', '계좌이체', 1),
(1, 8, 'expense', 650000.00, '10월 오피스텔 월세', '월세 납부', '2026-10-05', '계좌이체', 1),
(1, 8, 'expense', 83000.00, '10월 통신비', '통신 요금', '2026-10-10', '자동이체', 1),
(1, 6, 'expense', 620000.00, '10월 식비 합산', '10월 마트 및 외식', '2026-10-20', '신용카드', 0),
(1, 7, 'expense', 110000.00, '10월 카페/음료', '커피 및 음료', '2026-10-22', '간편결제', 0),
(1, 9, 'expense', 85000.00, '10월 교통비', '대중교통 이용료', '2026-10-28', '신용카드', 0),
(1, 10, 'expense', 350000.00, '10월 가을 의류', '가을 옷 쇼핑', '2026-10-15', '신용카드', 0),
(1, 11, 'expense', 95000.00, '10월 도서 및 영화', '여가 생활', '2026-10-18', '체크카드', 0);

-- Past Month: 2026-09 Transactions
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `title`, `description`, `transaction_date`, `payment_method`, `is_fixed`) VALUES
(1, 1, 'income', 3800000.00, '9월 정기 급여', '정기 월급', '2026-09-25', '계좌이체', 1),
(1, 2, 'income', 1000000.00, '추석 특별 상여금', '명절 상여 입금', '2026-09-15', '계좌이체', 0),
(1, 8, 'expense', 650000.00, '9월 오피스텔 월세', '월세 납부', '2026-09-05', '계좌이체', 1),
(1, 6, 'expense', 580000.00, '9월 식비 합산', '식재료 및 외식', '2026-09-20', '신용카드', 0),
(1, 14, 'expense', 300000.00, '추석 부모님 선물', '명절 선물세트 및 용돈', '2026-09-14', '계좌이체', 0),
(1, 10, 'expense', 220000.00, '9월 생활용품 구매', '주방 및 욕실 소모품', '2026-09-18', '신용카드', 0);

-- --------------------------------------------------------
-- 5. Saving Goals
-- --------------------------------------------------------
INSERT INTO `saving_goals` (`user_id`, `title`, `target_amount`, `current_amount`, `start_date`, `end_date`, `category`, `status`, `icon`) VALUES
(1, '비상금 200만원 만들기', 2000000.00, 1450000.00, '2026-09-01', '2026-12-31', '비상금', 'ongoing', 'shield'),
(1, '연말 제주도 힐링 여행 경비', 800000.00, 560000.00, '2026-10-01', '2026-12-20', '여행', 'ongoing', 'plane'),
(1, '불필요한 카페/배달 30만원 줄이기', 300000.00, 300000.00, '2026-10-01', '2026-10-31', '지출절감', 'completed', 'coffee'),
(1, '새 노트북 구매 펀드', 1800000.00, 600000.00, '2026-11-01', '2027-02-28', '전자기기', 'ongoing', 'laptop');
