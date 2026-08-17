// Google Apps Script — 스프레드시트에 가입 신청 데이터를 쌓는 웹앱
//
// 설정 방법:
// 1. 새 구글 스프레드시트 생성
// 2. 확장 프로그램 → Apps Script → 이 코드 붙여넣기
// 3. 배포 → 새 배포 → 유형: 웹 앱
//    - 실행 계정: 나
//    - 액세스 권한: 모든 사용자
// 4. 발급된 웹 앱 URL을 recruit-form/.env 의 VITE_GAS_URL 에 넣기

const HEADERS = [
  "제출시각",
  "학번",
  "이름",
  "성별",
  "학과",
  "학년",
  "재학상태",
  "이메일",
  "전화번호",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 동시 제출 시 행 꼬임 방지

  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      new Date(),
      data.studentId || "",
      data.name || "",
      data.gender || "",
      data.department || "",
      data.grade || "",
      data.enrollmentStatus || "",
      data.email || "",
      data.phoneNumber || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
