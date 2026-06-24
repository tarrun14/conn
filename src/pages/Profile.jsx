import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg: #f5f0e8;
    --surface: #faf7f2;
    --border: #e2d9cc;
    --ink: #1a1612;
    --ink-muted: #7a6f63;
    --accent: #c8441a;
    --accent-hover: #a83515;
    --shadow: 0 2px 12px rgba(26,22,18,0.07);
    --radius: 10px;
    --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .profile-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    padding: 80px 24px 80px;
  }

  .profile-inner {
    max-width: 1000px;
    margin: 0 auto;
  }

  .profile-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 48px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
  }

  .profile-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
  }

  .profile-header .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
  }

  .section-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 16px;
  }

  .create-section {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 48px;
    box-shadow: var(--shadow);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .form-field {
    width: 100%;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 7px;
    padding: 11px 14px;
    font-family: inherit;
  }

  .btn-create {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 7px;
    padding: 11px 22px;
    cursor: pointer;
    font-weight: 500;
    transition: background var(--transition);
  }

  .btn-create:hover { background: var(--accent-hover); }

  .projects-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .project-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    cursor: pointer;
    position: relative;
    transition: transform var(--transition);
  }
  
  .project-card:hover { transform: translateY(-2px); }
  
  .delete-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #fceae8;
    color: var(--accent);
    border: 1px solid #f1cfc8;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 0.75rem;
    cursor: pointer;
    z-index: 10;
  }

  .delete-btn:hover { background: var(--accent); color: white; }

  .file-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px dashed var(--border);
    transition: all 200ms ease;
    align-self: flex-start;
  }
  .file-label:hover { border-color: var(--accent); color: var(--accent); }
  .file-input-hidden { display: none; }
  .cover-preview {
    width: 100%;
    max-width: 300px;
    height: 140px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid var(--border);
    margin-top: 10px;
  }
  .preview-wrap { position: relative; display: inline-block; }
  .remove-preview {
    position: absolute; top: 1px; right: 1px;
    background: var(--accent); color: white;
    border: none; width: 22px; height: 22px;
    border-radius: 50%; cursor: pointer;
    font-size: 10px; display: flex; align-items: center; justify-content: center;
  }
  .project-list-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 12px;
  }
  .project-tag {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }
  .tag-idea { background: #e3ebf3; color: #406d96; }
  .tag-in-progress { background: #fdf2d0; color: #9c6c06; }
  .tag-live { background: #dcf2e3; color: #2e7a46; }

  /* ── User Profile Area ── */
  .profile-info-section {
    margin-bottom: 48px;
  }
  .profile-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .profile-details h3 {
    font-size: 1.5rem;
    color: var(--ink);
    margin-bottom: 2px;
  }
  .profile-email {
    font-size: 0.95rem;
    color: var(--ink-muted);
  }
  .profile-meta {
    font-size: 0.9rem;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idea");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      const user = session?.user;
      
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) {
          setProfileData(profile);
          setEditName(profile.name || "");
          setEditAge(profile.age || "");
          setEditOccupation(profile.occupation || "");
        }
        
        await fetchProjects(user.id);
      }
    } catch (err) {
      console.error("Error fetching user:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (userId) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching projects:", error.message);
    else setProjects(data || []);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);

    let avatarUrl = profileData?.avatar_url || null;

    if (avatarFile) {
      const fileName = `avatar-${Date.now()}-${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile);

      if (uploadError) {
        alert("Avatar upload failed: " + uploadError.message);
        setSavingProfile(false);
        return;
      }
      
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      avatarUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: editName,
        age: editAge ? parseInt(editAge) : null,
        occupation: editOccupation,
        avatar_url: avatarUrl
      })
      .eq("id", user.id);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setProfileData({ ...profileData, name: editName, age: editAge, occupation: editOccupation, avatar_url: avatarUrl });
      setIsEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setSavingProfile(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const createProject = async () => {
    if (!user) return alert("You must be logged in");
    if (!title.trim()) return alert("Enter project title");

    setUploading(true);
    let imageUrl = null;

    if (image) {
      const fileName = `covers-${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, image);

      if (uploadError) {
        alert("Image upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }
      
      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ user_id: user.id, title, description, image_url: imageUrl, status }])
      .select(); // returns the created object

    if (error) {
      alert(error.message);
    } else {
      setProjects([data[0], ...projects]); // Update UI immediately
      setTitle("");
      setDescription("");
      setStatus("idea");
      setImage(null);
      setImagePreview(null);
    }
    setUploading(false);
  };

  const deleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Delete this project?\nThis action cannot be undone."
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id); // Extra safety layer

    if (error) {
      alert("Could not delete: " + error.message);
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  if (loading) return (
    <div className="profile-root">
      <div className="profile-inner">
        <SkeletonLoader type="page" />
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="profile-root">
        <div className="profile-inner">
          <div className="profile-header">
            <h2>My Profile</h2>
            <div className="dot" />
          </div>

          {/* USER PROFILE SECTION */}
          <div className="profile-info-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p className="section-label" style={{ marginBottom: 0 }}>User Info</p>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="profile-card">
               <div className="profile-avatar" style={{ overflow: 'hidden' }}>
                 {(avatarPreview || profileData?.avatar_url) ? (
                   <img src={avatarPreview || profileData?.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   profileData?.name ? profileData.name.charAt(0).toUpperCase() : "U"
                 )}
               </div>
               
               {isEditingProfile ? (
                 <div className="profile-details" style={{ flex: 1 }}>
                   <label className="file-label" style={{ marginBottom: '12px', alignSelf: 'flex-start' }}>
                     + Change Avatar
                     <input type="file" accept="image/*" className="file-input-hidden" onChange={handleAvatarChange} />
                   </label>
                   <input className="form-field" placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ marginBottom: '8px' }} />
                   <input className="form-field" type="number" placeholder="Age" value={editAge} onChange={(e) => setEditAge(e.target.value)} style={{ marginBottom: '8px' }} />
                   <input className="form-field" placeholder="Occupation" value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)} style={{ marginBottom: '12px' }} />
                   
                   <div style={{ display: 'flex', gap: '8px' }}>
                     <button className="btn-create" onClick={handleSaveProfile} disabled={savingProfile}>
                       {savingProfile ? "Saving..." : "Save"}
                     </button>
                     <button onClick={() => setIsEditingProfile(false)} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '11px 22px', borderRadius: '7px', cursor: 'pointer' }}>
                       Cancel
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="profile-details">
                   <h3>{profileData?.name || "User"}</h3>
                   <p className="profile-email">{profileData?.email}</p>
                   {profileData?.occupation && <p className="profile-meta">💼 {profileData.occupation}</p>}
                   {profileData?.age && <p className="profile-meta">🎂 {profileData.age} years old</p>}
                 </div>
               )}
            </div>
          </div>

          {/* CREATE SECTION */}
          <div className="create-section">
            <p className="section-label">New Project</p>
            <div className="form-group">
              <input
                className="form-field"
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="form-field"
                placeholder="Description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              
              <select
                className="form-field"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="idea">Concept / Idea</option>
                <option value="in progress">In Progress</option>
                <option value="live">Live</option>
              </select>

              <label className="file-label">
                + Add Project Cover Image
                <input
                  type="file"
                  accept="image/*"
                  className="file-input-hidden"
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <div className="preview-wrap">
                  <img src={imagePreview} className="cover-preview" alt="preview" />
                  <button className="remove-preview" onClick={() => { setImage(null); setImagePreview(null); }}>✕</button>
                </div>
              )}
            </div>
            <button className="btn-create" onClick={createProject} disabled={uploading}>
              {uploading ? "Creating..." : "Create Project"}
            </button>
          </div>

          {/* PROJECTS LIST */}
          <div>
            <p className="section-label">My Projects ({projects.length})</p>
            <div className="projects-list">
              {projects.length === 0 ? (
                <p style={{ color: "var(--ink-muted)" }}>No projects yet.</p>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="project-card"
                    onClick={() => navigate(`/project/${proj.id}`)}
                  >
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(proj.id);
                      }}
                    >
                      Delete
                    </button>
                    {proj.image_url && (
                      <img src={proj.image_url} alt="cover" className="project-list-img" />
                    )}
                    <div>
                      <span className={`project-tag tag-${(proj.status || 'idea').replace(' ', '-')}`}>
                        {proj.status || 'idea'}
                      </span>
                    </div>
                    <h4>{proj.title}</h4>
                    {proj.description && (
                      <p style={{ fontSize: "0.9rem", marginTop: "8px", color: "var(--ink-muted)" }}>
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}