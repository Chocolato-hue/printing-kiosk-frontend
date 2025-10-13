// src/services/PrinterService.ts

import { db } from "../firebase-config";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

// 🔍 Fetch all available printers from Firestore
export async function fetchAvailablePrinters(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, "printers"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("❌ Failed to fetch printers:", err);
    return [];
  }
}

// 🖨️ Get selected printer ID from local storage
export function getConnectedPrinter(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("selectedPrinter") || "default-printer";
  }
  return "default-printer";
}

// 🌐 Submit print job to Firestore
export async function submitPrintJob(
  imageUrl: string,
  options: {
    copies?: number;
    size?: string;
    orientation?: "portrait" | "landscape";
    colorMode?: "color" | "grayscale";
    duplex?: "one-sided" | "two-sided";
    margins?: { left?: number; right?: number; top?: number; bottom?: number };
    fitToPage?: boolean;
  },
  printerId?: string
): Promise<string> {
  try {
    // ✅ Get the selected printer ID
    const finalPrinterId = printerId || getConnectedPrinter();

    // ✅ Retrieve exact storage path from localStorage
    const storagePath =
      typeof window !== "undefined"
        ? localStorage.getItem("lastStoragePath")
        : null;

    if (!storagePath) {
      throw new Error(
        "Missing storagePath — please upload a file before submitting a print job."
      );
    }

    // ✅ Extract filename from path
    const fileName = storagePath.split("/").pop() || "unknown.jpg";

    // ✅ Create Firestore print job record
    const jobRef = await addDoc(collection(db, "printJobs"), {
      imageUrl,              // for user preview
      fileName,              // readable filename
      storagePath,           // exact path in Firebase Storage
      printerId: finalPrinterId,  // ✅ keep this
      options,
      paperSize: options.size,     // ✅ add this new line
      status: "pending",
      createdAt: serverTimestamp(),
    });


    console.log("✅ Print job created in Firestore:", jobRef.id);
    console.log("📦 Using storagePath:", storagePath);
    return jobRef.id;
  } catch (err) {
    console.error("❌ Failed to create print job:", err);
    throw err;
  }
}

// 🧠 Optional: simple Firestore health check
export async function checkHealth(): Promise<boolean> {
  try {
    await addDoc(collection(db, "_healthCheck"), {
      timestamp: serverTimestamp(),
    });
    console.log("✅ Firestore is reachable");
    return true;
  } catch (err) {
    console.error("❌ Firestore health check failed:", err);
    return false;
  }
}
