import React, { useState } from "react";
import OrderPanel from "./components/OrderPanel";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <OrderPanel />
    </div>
  );
}

export default App;
