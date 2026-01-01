import crypto from "crypto";

export interface MomoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  redirectUrl: string;
  ipnUrl: string;
  endpoint?: string; // default: https://test-payment.momo.vn
}

export interface CreatePaymentParams {
  amount: number;
  orderInfo: string;
  orderId?: string;
  requestId?: string;
  extraData?: Record<string, any>;
  lang?: "vi" | "en";
  autoCapture?: boolean;
}

export interface MomoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  [key: string]: any;
}

export class MomoSDK {
  private config: MomoConfig;

  constructor(config: MomoConfig) {
    this.config = {
      endpoint: "https://test-payment.momo.vn",
      ...config,
    };
  }

  private hmacSHA256(data: string): string {
    return crypto.createHmac("sha256", this.config.secretKey)
      .update(data)
      .digest("hex");
  }

  async createPayment(params: CreatePaymentParams): Promise<MomoPaymentResponse> {
    const orderId = params.orderId ?? `${this.config.partnerCode}${Date.now()}`;
    const requestId = params.requestId ?? orderId;
    const extraData = params.extraData
      ? Buffer.from(JSON.stringify(params.extraData)).toString("base64")
      : "";

    const requestType = "captureWallet";
    const rawSignature =
      `accessKey=${this.config.accessKey}` +
      `&amount=${params.amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${this.config.ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${params.orderInfo}` +
      `&partnerCode=${this.config.partnerCode}` +
      `&redirectUrl=${this.config.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = this.hmacSHA256(rawSignature);

    const body = {
      partnerCode: this.config.partnerCode,
      partnerName: "MoMo Partner",
      storeId: "MomoStore",
      requestType,
      ipnUrl: this.config.ipnUrl,
      redirectUrl: this.config.redirectUrl,
      orderId,
      amount: params.amount,
      lang: params.lang ?? "vi",
      orderInfo: params.orderInfo,
      requestId,
      autoCapture: params.autoCapture ?? true,
      extraData,
      signature,
    };

    const response = await fetch(`${this.config.endpoint}/v2/gateway/api/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`MoMo API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as MomoPaymentResponse;
  }

  validateCallback(data: Record<string, any>): boolean {
    const {
      accessKey,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
      signature,
    } = data;

    const rawSignature =
      `accessKey=${this.config.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expected = this.hmacSHA256(rawSignature);
    return expected === signature;
  }
}