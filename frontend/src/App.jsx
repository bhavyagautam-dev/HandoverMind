
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

import Dashboard from "./pages/Dashboard/Dashboard";
import Patients from "./pages/Patients/Patients";
import NewHandoff from "./pages/NewHandoff/NewHandoff";
import HandoffHistory from "./pages/HandoffHistory/HandoffHistory";
import IncomingHandoffInbox from "./pages/IncomingHandoffInbox/IncomingHandoffInbox";
import HandoffDetails from "./pages/HandoffDetails/HandoffDetails";

import ManagerDashboard from "./pages/ManagerDashboard/ManagerDashboard";
import NurseManagement from "./pages/NurseManagement/NurseManagement";
import StaffManagement from "./pages/StaffManagement/StaffManagement";
import PatientAssignments from "./pages/PatientAssignments/PatientAssignments";
import PatientManagement from "./pages/PatientManagement/PatientManagement";

import StaffDashboard from "./pages/StaffDashboard/StaffDashboard";
import SuperDashboard from "./pages/SuperDashboard/superdashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Super Admin */}
        <Route path="/super-admin" element={<SuperDashboard />} />

        {/* Nurse */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Staff */}
        <Route path="/staff" element={<StaffDashboard />} />

        {/* Patients */}
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:patientId" element={<Patients />} />

        {/* Handoffs */}
        <Route path="/new-handoff" element={<NewHandoff />} />
        <Route path="/handoff-history" element={<HandoffHistory />} />
        <Route path="/incoming-handoffs" element={<IncomingHandoffInbox />} />
        <Route path="/handoff-details/:handoffId" element={<HandoffDetails />} />

        {/* Manager */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/nurses" element={<NurseManagement />} />
        <Route path="/manager/staff" element={<StaffManagement />} />
        <Route path="/manager/assignments" element={<PatientAssignments />} />
        <Route path="/patient-management" element={<PatientManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
