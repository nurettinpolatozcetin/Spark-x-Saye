import { useEffect, useState } from "react";
import { supabase } from "../../Database/Supabase";
import "./Discover.css";

function Discover({ setSelectedProfile }) {
  const [profiles, setProfiles] = useState([]);

  const [filters, setFilters] = useState({
    geography: "",
    discipline: "",
    interest: "",
  });

  useEffect(() => {
    getProfiles();
  }, []);

  const normalizeText = (text = "") => {
    return text
      .toString()
      .trim()
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i");
  };
  const formatText = (text = "") => {
    return text
      .toLocaleLowerCase("tr-TR")
      .replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
  };

  const getProfiles = async () => {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Profiles fetch error:", error);
      return;
    }

    setProfiles(data || []);
  };

  const filteredProfiles = profiles.filter((profile) => {
    return (
      normalizeText(profile.geography).includes(
        normalizeText(filters.geography),
      ) &&
      normalizeText(profile.discipline).includes(
        normalizeText(filters.discipline),
      ) &&
      normalizeText(profile.interest).includes(normalizeText(filters.interest))
    );
  });

  return (
    <div className="discover-card">
      <h2>Discover</h2>
      <p>Search profiles by geography, discipline and interest.</p>

      <div className="filters">
        <input
          placeholder="Filter by geography"
          value={filters.geography}
          onChange={(e) =>
            setFilters({ ...filters, geography: e.target.value })
          }
        />

        <input
          placeholder="Filter by discipline"
          value={filters.discipline}
          onChange={(e) =>
            setFilters({ ...filters, discipline: e.target.value })
          }
        />

        <input
          placeholder="Filter by interest"
          value={filters.interest}
          onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
        />
      </div>

      <div className="profile-grid">
        {filteredProfiles.length === 0 ? (
          <p className="empty">No profiles found.</p>
        ) : (
          filteredProfiles.map((profile) => (
            <div className="profile-card" key={profile.id}>
              <span>{profile.role}</span>
              <h3>{profile.name}</h3>
              <p>{profile.bio}</p>
              <p>{formatText(profile.geography)}</p>
              <p>{formatText(profile.discipline)}</p>
              <p>{formatText(profile.interest)}</p>

              <button
                className="message-profile-btn"
                onClick={() => setSelectedProfile(profile)}
              >
                Message
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Discover;
