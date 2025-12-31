export enum OrderStatus {
    PROCESSING = "PROCESSING",
    SHIPPING = "SHIPPING",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}
export type OrderStatusType = "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}
export type PaymentStatusType = "PENDING" | "SUCCESS" | "FAILED";