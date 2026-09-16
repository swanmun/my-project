// 핵심 도메인 타입. 주제가 정해지면 Item을 실제 이름(Space, Product 등)으로 바꾸세요.

export type Item = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export type PaymentStatus = "READY" | "DONE" | "CANCELED" | "FAILED";

export type Payment = {
  id: string;
  user_id: string;
  item_id: string;
  order_id: string;
  payment_key: string | null;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  canceled_at: string | null;
};
