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
  imageFile?: File;
  imageUrl: string;
  printSize: PrintSize;
  quantity: number;
  totalPrice: number;
  printerId?: string;  // 🔹 optional because added later
  jobId?: string;      // 🔹 fixes the error
  layout?: "fullA5" | "two4x6"; // ✅ new optional layout field

}