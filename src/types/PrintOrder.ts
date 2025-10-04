export interface PrintSize {
  id: string;
  name: string;
  dimensions: string;
  price: number;
  minResolution: {
    width: number;
    height: number;
  };
}

export interface PrintOrder {
  id: string;
  imageFile: File;
  imageUrl: string;
  printSize: PrintSize;
  quantity: number;
  totalPrice: number;
}