import { useEffect, useState } from "react";
import { supabase } from "../../Database/Supabase";
import "./BuildProfile.css";

function BuildProfile({ setProfiles }) {
  const [profileId, setProfileId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    role: "Artist",
    geography: "",
    discipline: "",
    interest: "",
    bio: "",
  });

  useEffect(() => {
    getMyProfile();
  }, []);

  const getMyProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.log("Profile fetch error:", error);
      return;
    }

    if (data) {
      setProfileId(data.id);

      setForm({
        name: data.name || "",
        role: data.role || "Artist",
        geography: data.geography || "",
        discipline: data.discipline || "",
        interest: data.interest || "",
        bio: data.bio || "",
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first.");
      return;
    }

    const profileData = {
      ...form,
      user_id: userData.user.id,
    };

    if (profileId) {
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", profileId)
        .select();

      if (error) {
        console.log("Profile update error:", error);
        alert(error.message);
        return;
      }

      alert("Profile updated successfully!");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select();

    if (error) {
      console.log("Profile create error:", error);
      alert(error.message);
      return;
    }

    setProfileId(data[0].id);

    if (setProfiles) {
      setProfiles((prevProfiles) => [data[0], ...prevProfiles]);
    }

    alert("Profile created successfully!");
  };
  const normalize = (text) =>
    text.toLowerCase().replaceAll("ı", "i").replaceAll("İ", "i");

  const profileData = {
    ...form,
    geography: normalize(form.geography),
    discipline: normalize(form.discipline),
    interest: normalize(form.interest),
  };

  return (
    <div className="build-card">
      <h2>My Profile</h2>
      <p>Create or update your creative profile.</p>

      <form className="profile-form" onSubmit={saveProfile}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select name="role" value={form.role} onChange={handleChange}>
          <option>Artist</option>
          <option>Curator</option>
          <option>Institution</option>
        </select>

        <input
          name="geography"
          placeholder="Geography e.g. Istanbul"
          value={form.geography}
          onChange={handleChange}
          required
        />

        <input
          name="discipline"
          placeholder="Discipline e.g. Digital Art"
          value={form.discipline}
          onChange={handleChange}
          required
        />

        <input
          name="interest"
          placeholder="Interest e.g. AI, Photography"
          value={form.interest}
          onChange={handleChange}
          required
        />

        <textarea
          name="bio"
          placeholder="Short bio"
          value={form.bio}
          onChange={handleChange}
        />

        <button className="create-profile-btn" type="submit">
          {profileId ? "Update Profile" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}

export default BuildProfile;
