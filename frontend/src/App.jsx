import { BrowserRouter, Routes, Route } from "react-router-dom";

import CustomerRegister from "./pages/customer/CustomerRegister";
import UploadOrder from "./pages/customer/UploadOrder";
import OrderTracking from "./pages/customer/OrderTracking";
import OrderHistory from "./pages/customer/OrderHistory";
import Payment from "./pages/customer/Payment";


import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerOrders from "./pages/owner/OwnerOrders";

import Feedback, { FeedbackButton } from "./pages/feedback/FeedBack"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerRegister />} />
        <Route path="/upload" element={<UploadOrder />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/orderhistory" element={<OrderHistory />} />
        <Route path="/payment" element={<Payment />} />
 

        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-orders" element={<OwnerOrders />} />

        <Route path="/feedback" element={<Feedback />} />

      </Routes>
      <FeedbackButton />

      
    </BrowserRouter>
  );
}

export default App;