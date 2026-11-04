/** ショップの画面に渡す商品（ロケールに合わせた名前にしてから渡す） */
export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  images: string[];
};

export type ShopRule = {
  shippingFee: number;
  freeShippingThreshold: number | null;
  overseasShippingFee: number;
  deliveryNote: string;
};
