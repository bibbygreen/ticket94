exports.processPayment = async (prime, orderDetails) => {
  const url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime";
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.TAPPAY_PARTNER_KEY,
  };
  const body = {
    prime: prime,
    partner_key: process.env.PARTNER_KEY,
    merchant_id: process.env.MERCHANT_ID,
    details: "Purchase Description",
    amount: orderDetails.amount,
    cardholder: {
      name: orderDetails.contact.name,
      email: orderDetails.contact.email,
      phone_number: orderDetails.contact.phone,
    },
    remember: false,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  return await response.json();
};
