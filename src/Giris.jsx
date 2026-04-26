import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "./Database/Supabase";

import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import BuildProfile from "./Pages/BuildProfile/BuildProfile";
import Discover from "./Pages/Discover/Discover";
import Archive from "./Pages/Archive/Archive";
import Auth from "./Pages/Auth/Auth";
import ChatWidget from "./Components/Messages/Chat";

import "./Giris.css";

function Giris() {
  const [profiles, setProfiles] = useState([]);
  const [works, setWorks] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [isDevBypass, setIsDevBypass] = useState(false);
  const isAuthenticated = user || isDevBypass;

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        {isAuthenticated && (
          <Navbar user={user} setIsDevBypass={setIsDevBypass} />
        )}
        <Routes>
          <Route
            path="/auth"
            element={<Auth setIsDevBypass={setIsDevBypass} />}
          />
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Home />} />
              <Route
                path="/build"
                element={
                  <BuildProfile profiles={profiles} setProfiles={setProfiles} />
                }
              />
              <Route
                path="/discover"
                element={<Discover setSelectedProfile={setSelectedProfile} />}
              />
              <Route
                path="/archive"
                element={<Archive works={works} setWorks={setWorks} />}
              />
            </>
          ) : (
            <Route
              path="*"
              element={<Auth setIsDevBypass={setIsDevBypass} />}
            />
          )}
        </Routes>
        {isAuthenticated && (
          <ChatWidget
            selectedProfile={selectedProfile}
            setSelectedProfile={setSelectedProfile}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default Giris;
