import { useState, useEffect } from "react";
import { supabase } from "../../Database/Supabase";
import "./Archive.css";

function Archive({ works, setWorks }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
  });
  useEffect(() => {
    getWorks();
  }, []);

  const getWorks = async () => {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Works fetch error:", error);
      return;
    }

    setWorks(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
  };

  const addWork = async (e) => {
    e.preventDefault();

    let imageUrl = "";

    if (selectedImage) {
      const fileName = `${Date.now()}-${selectedImage.name}`;

      const { error: uploadError } = await supabase.storage
        .from("works")
        .upload(fileName, selectedImage);

      if (uploadError) {
        console.log("Image upload error:", uploadError);
        alert("Image could not be uploaded.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("works")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const newWork = {
      ...form,
      image: imageUrl,
    };

    const { data, error } = await supabase
      .from("works")
      .insert([newWork])
      .select();

    if (error) {
      console.log("Work insert error:", error);
      alert("Work could not be added.");
      return;
    }

    setWorks((prevWorks) => [data[0], ...prevWorks]);

    setForm({
      title: "",
      description: "",
      link: "",
      image: "",
    });

    setSelectedImage(null);

    alert("Work added successfully!");
  };

  return (
    <div className="archive-card">
      <h2>Archive</h2>
      <p>Showcase creative works with text, images and links.</p>

      <form onSubmit={addWork} className="archive-form">
        <input
          name="title"
          placeholder="Work title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="link"
          placeholder="Work link (optional)"
          value={form.link}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleImageUpload}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <button className="add-work-btn" type="submit">
          Add Work
        </button>
      </form>

      <div className="works-grid">
        {works.length === 0 ? (
          <p className="empty">No works yet.</p>
        ) : (
          works.map((work) => (
            <div className="work-card" key={work.id}>
              {work.image && (
                <img className="work-image" src={work.image} alt={work.title} />
              )}

              <h3>{work.title}</h3>
              <p>{work.description}</p>

              {work.link && (
                <a href={work.link} target="_blank" rel="noreferrer">
                  View Work
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Archive;
