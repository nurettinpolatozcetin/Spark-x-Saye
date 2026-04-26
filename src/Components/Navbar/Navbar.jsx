import { Link } from "react-router-dom";
import { supabase } from "../../Database/Supabase";
import "./Navbar.css";

function Navbar({ user, setIsDevBypass }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();

    if (setIsDevBypass) {
      setIsDevBypass(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/discover">Discover</Link>
        <Link to="/archive">Archive</Link>
        <Link to="/build">My Profile</Link>
      </div>

      <div className="navbar-right">
        <span className="user-email">{user?.email || "Demo User"}</span>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
