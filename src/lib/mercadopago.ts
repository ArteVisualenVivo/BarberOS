import MercadoPago from "mercadopago";

const mercadopago = new (MercadoPago as any)({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export default mercadopago as any;
