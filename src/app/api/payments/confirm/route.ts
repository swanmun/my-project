import { NextResponse } from "next/server";

// 결제 승인: 토스페이먼츠 결제 승인 API 호출 후 payments 테이블에 저장
// https://docs.tosspayments.com/reference#결제-승인
export async function POST() {
  // TODO: body에서 paymentKey, orderId, amount 받기
  // TODO: 금액 위변조 검증 → 토스 승인 API 호출 (TOSS_SECRET_KEY) → DB 저장
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
