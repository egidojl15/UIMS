import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MapProvider } from "./pages/MapContext"; // ADD THIS IMPORT

// Public page imports
import HomeCommunityHub from "./pages/Home";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import SpotMap from "./pages/SpotMap";
import ProjectActivity from "./pages/ProjectActivity";
import Officials from "./pages/Officials";
import Request from "./pages/Request";
import Login from "./pages/Login";

// Dashboard component imports
import BhwDashboard from "./dashboard/BhwDashboard";
import BrgyCouncilor from "./dashboard/BrgyCouncilor";
import SecretaryDashboard from "./dashboard/SecretaryDashboard";
import BarangayCaptainDashboard from "./dashboard/barangay_captain_dashboard";


// Import the page components
import ComplaintsPage from "./pages/Complaints";
import BlotterPage from "./pages/Blotter";
import ActivityLogPage from "./pages/ActivityLogPage";
import MyProfile from "./pages/MyProfile";
// import User from './pages/UserManagement';

import LogBookPage from "./pages/LogBookPage";
import BhwMainDashboard from "./pages/BhwMainDashboard";
import ManageResidentPage from "./pages/ManageResidentPage";
import ManageHouseholdsPage from "./pages/ManageHouseholdsPage";
import HealthRecordsPage from "./pages/HealthRecordsPage";
import MedicalReferralPage from "./pages/MedicalReferralPage";
// import GenerateReportsPage from "./pages/GenerateReportsPage";
import MaternalChildHealthPage from "./pages/MaternalChildHealthPage";
import DeathReportsPage from "./pages/DeathReportsPage";
import BarangayDayDoc from "./pages/About";

// Layout imports
import PublicLayout from "./layouts/PublicLayout";

// Component imports
import PrivateRoute from "./components/PrivateRoute";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <MapProvider>
      {" "}
      {/* ADD THIS WRAPPER */}
      <Router>
        <AuthGuard>
          <Routes>
            {/* Standalone route for login */}
            <Route path="/login" element={<Login />} />
            {/* Public routes wrapped in PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomeCommunityHub />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/events" element={<Events />} />
              <Route path="/spotmap" element={<SpotMap />} />
              <Route path="/projectactivity" element={<ProjectActivity />} />
              <Route path="/officials" element={<Officials />} />
              <Route path="/request" element={<Request />} />
              <Route path="/about" element={<BarangayDayDoc />} />
            </Route>
            {/* Private routes for BHW with nested routes */}
            <Route
              path="/dashboard/bhw"
              element={
                <PrivateRoute allowedRoles={["barangay_health_worker"]}>
                  <BhwDashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<BhwMainDashboard />} />
              <Route path="manage-residents" element={<ManageResidentPage />} />
              <Route
                path="manage-households"
                element={<ManageHouseholdsPage />}
              />
              <Route path="health-records" element={<HealthRecordsPage />} />
              <Route
                path="maternal-child-health"
                element={<MaternalChildHealthPage />}
              />{" "}
              {/* New route */}
              <Route
                path="medical-referral"
                element={<MedicalReferralPage />}
              />
              <Route path="death-reports" element={<DeathReportsPage />} />
              {/* <Route path="generate-reports" element={<GenerateReportsPage />} /> */}
              <Route path="my-profile" element={<MyProfile />} />
              <Route path="activity-log" element={<ActivityLogPage />} />
            </Route>
            {/* Councilor Dashboard Routes */}
            <Route
              path="/dashboard/councilor"
              element={
                <PrivateRoute allowedRoles={["barangay_councilor"]}>
                  <BrgyCouncilor />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/councilor/complaints"
              element={
                <PrivateRoute allowedRoles={["barangay_councilor"]}>
                  <BrgyCouncilor>
                    <ComplaintsPage />
                  </BrgyCouncilor>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/councilor/blotter"
              element={
                <PrivateRoute allowedRoles={["barangay_councilor"]}>
                  <BrgyCouncilor>
                    <BlotterPage />
                  </BrgyCouncilor>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/councilor/activitylog"
              element={
                <PrivateRoute allowedRoles={["barangay_councilor"]}>
                  <BrgyCouncilor>
                    <ActivityLogPage />
                  </BrgyCouncilor>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/councilor/my-profile"
              element={
                <PrivateRoute allowedRoles={["barangay_councilor"]}>
                  <BrgyCouncilor>
                    <MyProfile />
                  </BrgyCouncilor>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/councilor/logbook"
              element={
                <PrivateRoute allowedRoles={["barangay_councilor"]}>
                  <BrgyCouncilor>
                    <LogBookPage />
                  </BrgyCouncilor>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/secretary"
              element={
                <PrivateRoute allowedRoles={["barangay_secretary"]}>
                  <SecretaryDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/captain"
              element={
                <PrivateRoute allowedRoles={["barangay_captain"]}>
                  <BarangayCaptainDashboard />
                </PrivateRoute>
              }
            />
            {/* Catch-all route for any other path */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthGuard>
      </Router>
    </MapProvider> // CLOSE THE WRAPPER HERE
  );
}

export default App;
