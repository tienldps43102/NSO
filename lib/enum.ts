export enum OrderStatus {
  PENDING = "PENDING",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
export type OrderStatusType = "PENDING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
export type PaymentStatusType = "PENDING" | "SUCCESS" | "FAILED";
