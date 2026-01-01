import crypto from "crypto";
import { nowVN } from "../day";

export interface VnpayConfig {
  tmnCode: string;
  hashSecret: string;
  returnUrl: string;
  vnpUrl?: string; // default sandbox
}

export interface CreatePaymentParams {
  amount: number;
  orderInfo: string;
  orderType?: string;
  bankCode?: string;
  locale?: "vn" | "en";
  ipAddr?: string;
  txnRef?: string;
  expireMinutes?: number;
}

export interface VerifyReturnResult {
  isValid: boolean;
  message: string;
  responseCode?: string;
  transactionStatus?: string;
  data?: Record<string, any>;
}

export class VnpaySDK {
  private config: VnpayConfig;

  constructor(config: VnpayConfig) {
    this.config = {
      vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      ...config,
    };
  }

  private phpUrlEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/%20/g, "+")
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A");
  }

  private hmacSHA512(data: string): string {
    return crypto.createHmac("sha512", this.config.hashSecret)
      .update(data, "utf-8")
      .digest("hex");
  }

  createPayment(params: CreatePaymentParams): string {
    const now = nowVN()
    const formatDate = now.format("YYYYMMDDHHmmss")
    const expire = now.add(params.expireMinutes ?? 15, "minute")
    const expireDate = expire.format("YYYYMMDDHHmmss")
    const txnRef = params.txnRef ?? Math.floor(Math.random() * 1000000).toString();
    const inputData: Record<string, any> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: params.amount * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: params.orderType ?? "other",
      vnp_Locale: params.locale ?? "vn",
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_IpAddr: params.ipAddr ?? "127.0.0.1",
      vnp_CreateDate: formatDate,
      vnp_ExpireDate: expireDate,
    };

    if (params.bankCode) inputData["vnp_BankCode"] = params.bankCode;

    const sortedKeys = Object.keys(inputData).sort();
    const signData = sortedKeys
      .map((k) => `${k}=${this.phpUrlEncode(inputData[k])}`)
      .join("&");

    const secureHash = this.hmacSHA512(signData);
    const query = `${signData}&vnp_SecureHash=${secureHash}`;
    return `${this.config.vnpUrl}?${query}`;
  }

  verifyReturn(query: Record<string, string>): VerifyReturnResult {
    const receivedHash = query["vnp_SecureHash"];
    if (!receivedHash) {
      return { isValid: false, message: "Thiếu chữ ký (vnp_SecureHash)" };
    }

    const inputData: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith("vnp_") && key !== "vnp_SecureHash") {
        inputData[key] = value;
      }
    }

    const sortedKeys = Object.keys(inputData ).sort();
    const signData = sortedKeys
      .map((k) => `${k}=${this.phpUrlEncode(inputData[k] as any)}`)
      .join("&");

    const expectedHash = this.hmacSHA512(signData);
    const isValid = expectedHash === receivedHash;

    const responseCode = query["vnp_ResponseCode"];
    const transactionStatus = query["vnp_TransactionStatus"];

    let message = "Chữ ký không hợp lệ";
    if (isValid) {
      if (responseCode === "00" && transactionStatus === "00") {
        message = "Giao dịch thành công";
      } else {
        message = `Giao dịch không thành công (${responseCode})`;
      }
    }

    return {
      isValid,
      message,
      responseCode,
      transactionStatus,
      data: inputData,
    };
  }
}