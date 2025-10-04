// src/services/PrinterService.ts

import { db } from "../firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// 🔌 Get currently connected printer from environment variable
export function getConnectedPrinter(): string {
  return process.env.NEXT_PUBLIC_PRINTER_ID || "default-printer";
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
  printerId: string = getConnectedPrinter()
): Promise<string> {
  try {
    const jobRef = await addDoc(collection(db, "printJobs"), {
      imageUrl,
      printerId,
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
