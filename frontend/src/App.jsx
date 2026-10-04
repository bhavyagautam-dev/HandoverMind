import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Patients from "./pages/Patients/Patients";
import NewHandoff from "./pages/NewHandoff/NewHandoff";
import HandoffHistory from "./pages/HandoffHistory/HandoffHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:patientId"  element={<Patients />} />
        <Route path="/new-handoff" element={<NewHandoff />}/>
        <Route path="/handoff-history" element={<HandoffHistory />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;