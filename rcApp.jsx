[1mdiff --cc frontend/src/App.jsx[m
[1mindex c6e1080,3796187..0000000[m
[1m--- a/frontend/src/App.jsx[m
[1m+++ b/frontend/src/App.jsx[m
[36m@@@ -1,47 -1,38 +1,56 @@@[m
  [m
  import { BrowserRouter, Routes, Route } from "react-router-dom";[m
[32m++[m
  import Home from "./pages/Home/Home";[m
  import About from "./pages/About/About";[m
  import Login from "./pages/Login/Login";[m
  import Signup from "./pages/Signup/Signup";[m
[32m++[m
  import Dashboard from "./pages/Dashboard/Dashboard";[m
  import Patients from "./pages/Patients/Patients";[m
  import NewHandoff from "./pages/NewHandoff/NewHandoff";[m
  import HandoffHistory from "./pages/HandoffHistory/HandoffHistory";[m
  import IncomingHandoffInbox from "./pages/IncomingHandoffInbox/IncomingHandoffInbox";[m
  import HandoffDetails from "./pages/HandoffDetails/HandoffDetails";[m
[32m++[m
  import ManagerDashboard from "./pages/ManagerDashboard/ManagerDashboard";[m
  import NurseManagement from "./pages/NurseManagement/NurseManagement";[m
  import StaffManagement from "./pages/StaffManagement/StaffManagement";[m
  import PatientAssignments from "./pages/PatientAssignments/PatientAssignments";[m
  import PatientManagement from "./pages/PatientManagement/PatientManagement";[m
[31m- import NonStaffDashboard from "./pages/non-staff-dashboard/non-staff-dashboard";[m
[32m +[m
[31m- // Super Admin Dashboard[m
[31m- import SuperDashboard from "./pages/superdashboard/superdashboard.jsx";[m
[32m+ import StaffDashboard from "./pages/StaffDashboard/StaffDashboard";[m
[32m++import SuperDashboard from "./pages/SuperDashboard/superdashboard.jsx";[m
  [m
  function App() {[m
    return ([m
      <BrowserRouter>[m
        <Routes>[m
[31m--        <Route path="/about" element={<About />} />[m
          <Route path="/" element={<Home />} />[m
[32m++        <Route path="/about" element={<About />} />[m
          <Route path="/login" element={<Login />} />[m
          <Route path="/signup" element={<Signup />} />[m
[32m +[m
[32m++        {/* Super Admin */}[m
[32m++        <Route path="/super-admin" element={<SuperDashboard />} />[m
[32m++[m
[32m++        {/* Nurse */}[m
          <Route path="/dashboard" element={<Dashboard />} />[m
[31m-         <Route path="/staff" element={<NonStaffDashboard />} />[m
[32m +[m
[31m-         {/* Super Admin Dashboard */}[m
[31m-         <Route path="/super-admin" element={<SuperDashboard />} />[m
[32m++        {/* Staff */}[m
[32m+         <Route path="/staff" element={<StaffDashboard />} />[m
[32m +[m
[32m++        {/* Patients */}[m
          <Route path="/patients" element={<Patients />} />[m
          <Route path="/patients/:patientId" element={<Patients />} />[m
[32m++[m
[32m++        {/* Handoffs */}[m
          <Route path="/new-handoff" element={<NewHandoff />} />[m
          <Route path="/handoff-history" element={<HandoffHistory />} />[m
          <Route path="/incoming-handoffs" element={<IncomingHandoffInbox />} />[m
          <Route path="/handoff-details/:handoffId" element={<HandoffDetails />} />[m
[32m +[m
[32m++        {/* Manager */}[m
          <Route path="/manager" element={<ManagerDashboard />} />[m
          <Route path="/manager/nurses" element={<NurseManagement />} />[m
          <Route path="/manager/staff" element={<StaffManagement />} />[m
