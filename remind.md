# Salesio Alumnae OS - 작업 상태 요약 (Checkpoint)

이 파일은 프로젝트 재개 시 현재 상태를 빠르게 파악하기 위해 작성되었습니다.

## 1. 현재 진행 상황 (Current Status)

**"살레시오 여고 동문회 관리 시스템"**의 핵심 기능들이 Supabase 데이터베이스와 성공적으로 연동되었습니다.

### ✅ 완료된 기능
1.  **동문 인명록 (Directory)**
    *   Supabase `alumnae` 테이블 연동 완료 (Mock Data 제거).
    *   **사진 업로드 기능**: `alumnae-photos` 스토리지 버킷 연동 및 권한/UI 문제 해결 완료.
    *   CRUD (등록, 수정, 삭제) 및 검색/필터 기능 정상 작동.
2.  **추억 아카이브 (Library)**
    *   Supabase `archive_photos` 테이블 생성 및 연동 완료.
    *   사진 업로드 및 갤러리 조회 기능 구현됨.
3.  **행사 및 소모임 (Gatherings)**
    *   Supabase `gatherings` 테이블 생성 및 연동 완료.
    *   칸반 보드(기획/접수/진행/완료) 형태의 조회 및 상태 관리.
    *   **모임 만들기** 및 **참여 신청(+1)** 기능 구현됨.

---

## 2. 기술적 설정 (Technical Setup)

### Supabase
*   **프로젝트**: Salesio Alumnae OS (설정 파일: `.env.local`)
*   **Database Tables**:
    *   `alumnae`: 동문 정보 (PK: `id`, 이미지: `photo_url`)
    *   `archive_photos`: 추억 사진 (PK: `id`, 컬럼: `title`, `photo_url`, `taken_at`)
    *   `gatherings`: 행사 정보 (PK: `id`, 컬럼: `status` ('planning', 'open', ...), `participants`)
*   **Storage Buckets**:
    *   `alumnae-photos` (Public Access 정책 적용됨)

### 주요 파일 위치
*   인명록: `app/(dashboard)/directory/page.tsx`
*   아카이브: `app/(dashboard)/library/page.tsx`
*   소모임: `app/(dashboard)/gatherings/page.tsx`

---

## 3. 다음에 해야 할 작업 (Action Items)

마지막 요청사항을 반영하여, 돌아오시면 아래 작업을 바로 시작하시면 됩니다.

### 🟥 우선 순위 (High Priority)
1.  **[행사 및 소모임] 수정 기능 구현**
    *   현재 '모임 만들기'는 있지만, 만들어진 모임 내용을 **수정(Edit)**하는 기능이 없습니다.
    *   카드 클릭 또는 '더보기' 메뉴를 통해 수정 Dialog를 띄우는 기능 추가 필요.
2.  **[행사 및 소모임] 초기 참여 인원 설정**
    *   모임 생성 시 `participants`를 0명이 아닌, **초기 인원(예: 5명)**으로 설정할 수 있는 입력 필드 추가 필요.

### 🟨 보완 사항
*   **어드민 페이지 연동**: `app/(dashboard)/admin/page.tsx`는 아직 연동되지 않았습니다. 추후 실제 데이터 통계와 연결이 필요합니다.

---

## 4. 실행 방법 (Resume Guide)
터미널에서 아래 명령어로 바로 시작할 수 있습니다.

```bash
cd c:/dev/antigravity/website/salesio-alumnae-os
npm run dev
```
