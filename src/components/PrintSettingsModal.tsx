// src/components/PrintSettingsModal.tsx
import React, { useState } from "react";

interface PrintSettings {
  printer: { name: string };
  options: {
    copies?: number;
    size?: string;
    orientation?: "portrait" | "landscape";
    colorMode?: "color" | "grayscale";
    duplex?: "one-sided" | "two-sided";
    margins?: { left?: number; right?: number; top?: number; bottom?: number };
    fitToPage?: boolean;
  };
}

const PrintSettingsModal: React.FC<{ onChange: (settings: PrintSettings) => void }> = ({ onChange }) => {
  const [settings, setSettings] = useState<PrintSettings>({
    printer: { name: "HP_LaserJet" },
    options: {
      copies: 1,
      size: "A4",
      orientation: "portrait",
      colorMode: "color",
      duplex: "one-sided",
      margins: { left: 10, right: 10, top: 20, bottom: 20 },
      fitToPage: true,
    },
  });

  const handleChange = (field: keyof PrintSettings["options"], value: any) => {
    const newSettings = {
      ...settings,
      options: { ...settings.options, [field]: value },
    };
    setSettings(newSettings);
    onChange(newSettings);
  };

  return (
    <div className="p-4 border rounded space-y-2 bg-gray-100">
      <h3 className="text-lg font-semibold">Print Settings</h3>

      <label>
        Copies:
        <input
          type="number"
          value={settings.options.copies}
          min={1}
          onChange={(e) => handleChange("copies", Number(e.target.value))}
        />
      </label>

      <label>
        Paper Size:
        <select
          value={settings.options.size}
          onChange={(e) => handleChange("size", e.target.value)}
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
          <option value="A3">A3</option>
        </select>
      </label>

      <label>
        Orientation:
        <select
          value={settings.options.orientation}
          onChange={(e) => handleChange("orientation", e.target.value as "portrait" | "landscape")}
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>

      <label>
        Color:
        <select
          value={settings.options.colorMode}
          onChange={(e) => handleChange("colorMode", e.target.value as "color" | "grayscale")}
        >
          <option value="color">Color</option>
          <option value="grayscale">Grayscale</option>
        </select>
      </label>

      <label>
        Duplex:
        <select
          value={settings.options.duplex}
          onChange={(e) => handleChange("duplex", e.target.value as "one-sided" | "two-sided")}
        >
          <option value="one-sided">One-sided</option>
          <option value="two-sided">Two-sided</option>
        </select>
      </label>

      <label>
        Fit to Page:
        <input
          type="checkbox"
          checked={settings.options.fitToPage}
          onChange={(e) => handleChange("fitToPage", e.target.checked)}
        />
      </label>
    </div>
  );
};

export default PrintSettingsModal;
