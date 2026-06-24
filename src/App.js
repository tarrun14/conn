import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Following from "./pages/Following";
import Followers from "./pages/Followers"; 
import UserProfile from "./pages/UserProfile";
import ProjectPage from "./pages/ProjectPage";
import ProjectHub from "./pages/ProjectHub";

// Components
import Sidebar from "./components/Sidebar";

// Pages where navbar should NOT appear
const NO_NAVBAR_ROUTES = ["/", "/login", "/signup"];

function Layout() {
  const location = useLocation();
  const showNavbar = !NO_NAVBAR_ROUTES.includes(location.pathname);

  return (
    <>
      {showNavbar && <Sidebar />}
      <main className="main-content" style={showNavbar ? { marginTop: 64 } : {}}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Signup */}
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard */}
          <Route path="/home" element={<Home />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/following" element={<Following />} />
          <Route path="/followers" element={<Followers />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/project-hub" element={<ProjectHub />} />

        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;