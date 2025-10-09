// src/services/PrinterService.ts

import { db } from "../firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// 🔍 Dynamically fetch printer ID from backend
export async function getConnectedPrinter(): Promise<string> {
  try {
    // You can replace localhost with your Dell backend’s local IP (or Netlify backend proxy URL)
    const res = await fetch("http://localhost:3001/status");
    const data = await res.json();
    if (data.printerId) {
      console.log("🖨️ Detected printer:", data.printerId);
      return data.printerId;
    }
  } catch (err) {
    console.warn("⚠️ Could not reach printer backend, fallback to default.");
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
    // If no printerId passed, fetch it dynamically
    const finalPrinterId = printerId || (await getConnectedPrinter());

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
