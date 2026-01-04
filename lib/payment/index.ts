import { MomoSDK } from "./momo.sdk";

export const momoSdk = new MomoSDK({
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  redirectUrl: process.env.MOMO_REDIRECT_URL!,
  ipnUrl: process.env.MOMO_IPN_URL!,
});
import { VnpaySDK } from "./vnpay.sdk";

export const vnpaySdk = new VnpaySDK({
  tmnCode: "1ZV0O07W",
  hashSecret: "3UO4AFJAKL67E7H9WHVJTXMPL6TUQMHN",
  vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.VNPAY_RETURN_URL!,
});

interface CreatePaymentParams {
  id: string;
  amount: number;
  orderInfo: string;
  method: "MOMO" | "VNPAY";
}
export async function createPayment({ id, amount, orderInfo, method }: CreatePaymentParams) {
  if (method === "MOMO") {
    return await momoSdk
      .createPayment({
        amount: amount,
        orderInfo: orderInfo,
        requestId: id,
        lang: "vi",
      })
      .then((res) => res.payUrl!);
  } else if (method === "VNPAY") {
    return vnpaySdk.createPayment({
      amount: amount,
      orderInfo: orderInfo,
      txnRef: id,
    });
  }
  throw new Error("Invalid method");
}

interface VerifyPaymentParams {
  args: Record<string, any>;
  method: "MOMO" | "VNPAY";
}
export function verifyPayment({ args, method }: VerifyPaymentParams) {
  if (method === "MOMO") {
    const result = momoSdk.validateCallback(args);
    return {
      success: result,
      isSuccess: args.resultCode === 0,
      id: args.requestId,
    };
  } else if (method === "VNPAY") {
    const result = vnpaySdk.verifyReturn(args);
    return {
      success: result.isValid,
      isSuccess: result.responseCode === "00" && result.transactionStatus === "00",
      id: args.vnp_TxnRef,
    };
  }
  throw new Error("Invalid method");
}
