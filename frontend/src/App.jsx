import { BrowserRouter, Routes, Route } from "react-router-dom";

import CustomerRegister from "./pages/CustomerRegister";
import UploadOrder from "./pages/UploadOrder";
import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<CustomerRegister />}
        />

        <Route
          path="/upload"
          element={<UploadOrder />}
        />

        <Route
          path="/tracking"
          element={<OrderTracking />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;