import { NextResponse } from "next/server";

// 결제 취소: 토스페이먼츠 결제 취소 API 호출 후 payments 상태를 CANCELED로 변경
// https://docs.tosspayments.com/reference#결제-취소
export async function POST() {
  // TODO: body에서 paymentKey, cancelReason 받기
  // TODO: 본인 결제인지 확인 → 토스 취소 API 호출 → DB 상태 업데이트
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
