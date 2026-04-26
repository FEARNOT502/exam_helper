# Exam Helper

시험 족보를 단답형/서술형 카드로 분해하여 반복 학습할 수 있는 웹 애플리케이션입니다. 간격 반복(Spaced Repetition) 알고리즘 기반으로 최적의 복습 시점을 자동 산출하고, Supabase를 통해 모든 기기에서 학습 데이터를 동기화합니다.

**Demo**: https://fearnot502.github.io/exam_helper/

---

## 목차

1. [주요 기능](#주요-기능)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [시작하기](#시작하기)
5. [사용 방법](#사용-방법)
6. [데이터 관리](#데이터-관리)
7. [학습 알고리즘](#학습-알고리즘)
8. [라이선스](#라이선스)

---

## 주요 기능

### 계정 및 클라우드 동기화
- 이메일 또는 Google 계정으로 로그인
- Supabase 기반 클라우드 저장으로 모든 기기에서 족보 동기화
- 비로그인 상태에서도 오프라인(LocalStorage) 모드로 동작
- 로그인 시 기존 로컬 데이터 자동 클라우드 업로드

### 학습 통계
- 학습 스트릭(연속 학습일) 및 역대 최고 스트릭 표시
- 12주 학습 캘린더 히트맵
- 최근 14일 일별 정답률 그래프
- 누적 정답률, 총 학습 시간, 세션 기록

### 족보 세트 관리
- 과목별/시험별로 족보 세트를 생성하고 제목, 부제목, 태그를 부여하여 체계적으로 관리
- 세트 단위의 검색 및 필터링 지원
- 드래그 앤 드롭으로 문제 순서 재배치

### 두 가지 문제 유형
- **단답형(빈칸)**: 텍스트 내 키워드를 `{{키워드}}` 형식으로 감싸면 빈칸 문제로 변환. 에디터에서 텍스트를 드래그 선택하면 자동으로 빈칸 마크업이 적용됨
- **서술형**: 자유 서술 형식의 문제와 모범 답안을 등록하고, 학습 시 자기 평가(완벽/부분정답/오답)로 진도를 관리

### 학습 모드
- 전체/미학습/오답/셔플 등 다양한 필터로 학습 범위 선택
- 단답형은 자동 채점 (한국어 형태소 기반 — 어미/조사가 달라도 정답 인정)
- 서술형은 한국어 어간 매칭 + 글자 bigram 유사도(%)로 자동 채점 추천
- 학습 중 힌트 기능 (3초간 정답 노출)
- 키보드 단축키 지원 (좌우 화살표로 문제 이동, Enter로 제출)
- 학습 완료 후 정답률 및 오답 목록 요약 제공
- 세션 종료 시 학습 기록 자동 저장

### 연습 모드
- 정답을 미리 표시한 상태에서 직접 따라 입력하는 필사 학습
- 단답형은 빈칸별 실시간 정오답 피드백, 서술형은 글자 단위 매칭 비교
- 모든 빈칸을 정확히 채우면 자동으로 다음 문제로 전환

### 오답 노트
- 마지막 시도에서 틀린 문제만 자동 수집
- 내 답변과 정답을 나란히 비교
- 오답 문제만 골라 재학습 가능

### 체계적인 간격 복습
- 4단계 암기 레벨 (미학습 / 학습중 / 거의암기 / 암기완료)
- 레벨별 복습 주기 자동 계산 (즉시 / 1일 / 3일 / 7일)
- 정답 시 레벨 상승, 오답 시 레벨 초기화

### 내보내기/가져오기
- 족보 세트를 JSON 파일로 내보내기
- JSON 파일을 불러와 족보 세트 복원

### 기타
- 다크 모드/라이트 모드/시스템 설정 전환
- 반응형 레이아웃
- 개인정보처리방침 페이지

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 빌드 도구 | Vite 8 |
| 라우팅 | React Router v7 |
| 스타일링 | Tailwind CSS v4 + CSS Custom Properties |
| 백엔드/DB | Supabase (PostgreSQL + Auth + RLS) |
| 드래그 앤 드롭 | @dnd-kit |
| 배포 | GitHub Pages (GitHub Actions) |
| 폰트 | Pretendard Variable, JetBrains Mono |

---

## 프로젝트 구조

```
src/
  components/
    common/        # Button, Modal, Badge, Toast, Topbar 등 공용 UI
    dashboard/     # SetCard, StatsOverview 등 대시보드 전용 컴포넌트
    editor/        # BlankSelector, QuestionList, TagInput 등 문제 편집 컴포넌트
    study/         # BlankInput, EssayInput, ResultSummary 등 학습 컴포넌트
  context/
    ThemeContext    # 다크/라이트 모드 상태 관리
    ToastContext    # 알림 토스트 상태 관리
    AuthContext     # Supabase 인증 상태 관리
    ExamSetsContext # 족보 데이터 전역 상태 (클라우드 동기화 포함)
  hooks/
    useExamSets    # 족보 CRUD 및 문제 관리 로직
    useLocalStorage # LocalStorage 동기화 훅
    useStudySession # 학습 세션 상태 및 진행 관리
  lib/
    supabase.ts         # Supabase 클라이언트
    examSetsService.ts  # 족보/문제 클라우드 CRUD
    statsService.ts     # 학습 세션 기록 및 통계 집계
  pages/
    Dashboard      # 메인 화면 (족보 목록)
    SetDetail      # 족보 상세 (문제 목록, 학습/연습/내보내기 진입)
    QuestionEditor # 문제 생성 및 편집
    StudyMode      # 학습 모드 (채점 + 복습 주기 업데이트)
    PracticeMode   # 연습 모드 (필사 학습)
    WrongNotes     # 오답 노트
    Statistics     # 학습 통계 (스트릭, 캘린더, 그래프)
    Login          # 로그인/회원가입
    Privacy        # 개인정보처리방침
  types/
    index.ts       # ExamSet, Question, AttemptRecord 등 타입 정의
  utils/
    blank-parser        # 빈칸 마크업 파싱, 한국어 형태소 기반 유사도 계산
    spaced-repetition   # 암기 레벨 업데이트, 복습 시점 판단
    export-import       # JSON 내보내기/가져오기
supabase/
  schema.sql       # DB 스키마 + RLS 정책
```

---

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 9 이상
- Supabase 프로젝트 (선택 — 없으면 오프라인 모드로 동작)

### 설치 및 실행

```bash
# 저장소 복제
git clone https://github.com/FEARNOT502/exam_helper.git
cd exam_helper

# 의존성 설치
npm install

# 환경변수 설정 (Supabase 사용 시)
cp .env.example .env
# .env 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력

# 개발 서버 실행
npm run dev
```

개발 서버가 실행되면 `http://localhost:5173/exam_helper/` 에서 확인할 수 있습니다.

### Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. `.env` 파일에 Project URL과 anon key 입력

### 배포 (GitHub Actions)

GitHub 저장소 Settings → Secrets에 아래 두 값을 등록하면 `main` 브랜치 푸시 시 자동 배포됩니다.

```
VITE_SUPABASE_URL=https://프로젝트ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 사용 방법

### 1. 족보 세트 만들기

대시보드에서 "새 족보" 버튼을 클릭하고 제목, 부제목(선택), 태그(선택)를 입력합니다.

### 2. 문제 추가하기

세트 상세 화면에서 "문제 추가" 버튼을 클릭합니다.

**단답형 문제 작성법:**
```
운영체제의 주요 기능 중 {{프로세스 관리}}는 CPU 스케줄링을 담당하고,
{{메모리 관리}}는 가상 메모리와 페이징을 처리한다.
```
텍스트를 입력한 뒤 정답으로 만들 키워드를 드래그 선택하면 자동으로 `{{}}` 마크업이 적용됩니다.

**서술형 문제 작성법:**
문제 내용과 모범 답안을 각각 입력합니다. 모범 답안은 선택 사항입니다.

### 3. 학습하기

세트 상세 화면에서 "학습 시작" 버튼을 클릭하고 학습 범위를 선택합니다:
- **전체 문제**: 모든 문제를 순서대로
- **미학습 문제만**: 아직 한 번도 학습하지 않은 문제
- **오답 문제만**: 틀린 이력이 있는 문제
- **전체 셔플**: 모든 문제를 랜덤 순서로

### 4. 통계 확인하기

상단 네비게이션의 "통계" 탭에서 학습 스트릭, 캘린더 히트맵, 정답률 그래프를 확인할 수 있습니다.

---

## 데이터 관리

로그인한 경우 Supabase에 자동 저장되며 모든 기기에서 동기화됩니다. 비로그인 상태에서는 브라우저 LocalStorage(`exam-master-data`)에 저장됩니다.

데이터 백업이 필요한 경우 세트 상세 화면의 "내보내기" 기능으로 JSON 파일을 다운로드하고, 필요 시 "가져오기"로 복원할 수 있습니다.

---

## 학습 알고리즘

간격 반복(Spaced Repetition) 알고리즘을 사용합니다.

| 레벨 | 상태 | 다음 복습까지 |
|------|------|--------------|
| 0 | 미학습 | 즉시 |
| 1 | 학습중 | 1일 후 |
| 2 | 거의암기 | 3일 후 |
| 3 | 암기완료 | 7일 후 |

- 정답을 맞히면 레벨이 1단계 상승합니다.
- 오답 시 레벨이 0(미학습)으로 초기화됩니다.
- 서술형의 경우 "부분 정답" 평가 시 레벨이 유지됩니다.

### 형태소 기반 채점

서술형 유사도 채점은 단순 단어 매칭이 아닌 한국어 어간 추출 방식을 사용합니다.

- 어미/조사를 제거한 어간으로 비교 (예: "수행하였다" = "수행한다")
- 어간 recall(모범답안 커버율) 70% + 글자 bigram 유사도 30% 가중 평균
- 80% 이상 → 정답 추천 / 40~79% → 부분정답 추천 / 40% 미만 → 오답 추천

---

## 라이선스

MIT License
