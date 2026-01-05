export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
export type OrderStatusType = "PENDING" |"CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
export type PaymentStatusType = "PENDING" | "SUCCESS" | "FAILED";
