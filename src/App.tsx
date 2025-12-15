import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./components/HomePage";
import SelectModePage from "./pages/SelectModePage";
import UploadPage from "./pages/UploadPage";
import UploadMultiplePage from "./pages/UploadMultiplePage";
import LayoutSelectionPage from "./pages/LayoutSelectionPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<HomePage />} />

          {/* Mode selection */}
          <Route path="/select-mode" element={<SelectModePage />} />

          {/* Upload flows */}
          <Route path="/upload/single" element={<UploadPage />} />
          <Route path="/upload/multiple" element={<UploadMultiplePage />} />

          {/* Layout selection */}
          <Route path="/layout-select" element={<LayoutSelectionPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
