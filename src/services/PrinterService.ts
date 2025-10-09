// src/services/PrinterService.ts

import { db } from "../firebase-config";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

// 🔍 Fetch all available printers from Firestore.
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
// 🖨️ Get selected printer ID from local storage (if user already picked one)
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
    // If no printerId passed, get from local storage
    const finalPrinterId = printerId || getConnectedPrinter();

    const jobRef = await addDoc(collection(db, "printJobs"), {
      imageUrl,
      printerId: finalPrinterId,
      options,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    console.log("✅ Print job created in Firestore:", jobRef.id);
    return jobRef.id;
  } catch (err) {
    console.error("❌ Failed to create print job:", err);
    throw err;
  }
}

// Optional: simple health check for Firestore connectivity
export async function checkHealth(): Promise<boolean> {
  try {
    // Try to add a small test doc then delete it
    const testRef = await addDoc(collection(db, "_healthCheck"), {
      timestamp: serverTimestamp(),
    });
    console.log("✅ Firestore is reachable");
    return true;
  } catch (err) {
    console.error("❌ Firestore health check failed:", err);
    return false;
  }
}
