import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
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

  .pp-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    padding: 48px 24px 80px;
  }

  .pp-inner {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* ── Project header ── */
  .pp-header {
    padding-bottom: 24px;
    border-bottom: 1.5px solid var(--border);
    margin-bottom: 36px;
  }

  .pp-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .pp-header p {
    font-size: 0.92rem;
    color: var(--ink-muted);
    font-weight: 300;
    line-height: 1.6;
  }

  /* ── Section label ── */
  .section-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 14px;
  }

  /* ── Community card ── */
  .community-section {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  /* ── Messages feed ── */
  .messages-feed {
    height: 360px;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    scroll-behavior: smooth;
  }

  .messages-feed::-webkit-scrollbar { width: 4px; }
  .messages-feed::-webkit-scrollbar-track { background: transparent; }
  .messages-feed::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── Message item ── */
  .message-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message-author {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .message-bubble {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0 8px 8px 8px;
    padding: 10px 14px;
    display: inline-flex;
    flex-direction: column;
    gap: 10px;
    max-width: 100%;
  }

  .message-text {
    font-size: 0.9rem;
    color: var(--ink);
    font-weight: 300;
    line-height: 1.55;
  }

  .message-img {
    width: 100%;
    max-width: 260px;
    border-radius: 7px;
    border: 1px solid var(--border);
    display: block;
    object-fit: cover;
  }

  /* ── Empty feed ── */
  .feed-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: var(--ink-muted);
  }

  .feed-empty .empty-icon { font-size: 1.6rem; opacity: 0.4; }
  .feed-empty p { font-size: 0.85rem; font-weight: 300; }

  /* ── Composer ── */
  .composer {
    border-top: 1.5px solid var(--border);
    background: var(--bg);
  }

  .composer-text-row {
    display: flex;
    align-items: center;
  }

  .composer-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: var(--ink);
    font-weight: 300;
  }

  .composer-input::placeholder {
    color: var(--ink-muted);
    opacity: 0.7;
  }

  .btn-post {
    flex-shrink: 0;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 14px 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background var(--transition);
    display: flex;
    align-items: center;
    gap: 7px;
    align-self: stretch;
  }

  .btn-post:hover { background: var(--accent-hover); }
  .btn-post:active { background: #8d2c11; }

  .btn-post svg {
    width: 14px;
    height: 14px;
    transform: rotate(-35deg);
    margin-bottom: 1px;
  }

  /* ── Attach row ── */
  .composer-attach-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 18px 10px;
    border-top: 1px solid var(--border);
  }

  .file-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid var(--border);
    transition: color var(--transition), border-color var(--transition), background var(--transition);
    user-select: none;
  }

  .file-label:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: rgba(200,68,26,0.05);
  }

  .file-label svg { width: 13px; height: 13px; flex-shrink: 0; }

  .file-input-hidden { display: none; }

  /* ── Image preview ── */
  .image-preview-wrap {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
  }

  .image-preview {
    height: 42px;
    width: 42px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid var(--border);
    display: block;
  }

  .preview-remove {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    border: none;
    font-size: 0.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }

  /* ── Loading ── */
  .pp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    color: var(--ink-muted);
    letter-spacing: 0.04em;
  }
`;

export default function ProjectPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const feedRef = useRef(null);
  const fileInputRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init(); }, [id]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      fetchProject();
      fetchMessages();
    } catch(err) {
      console.error(err);
    }
  };

  const fetchProject = async () => {
    const { data } = await supabase
      .from("projects").select("*").eq("id", id).single();
    setProject(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("project_messages")
      .select("*, profiles(name, avatar_url)")
      .eq("project_id", id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    if (!msgText.trim() && !image) return;
    if (!user) return;

    let imageUrl = null;

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, image);

      if (uploadError) { console.log(uploadError); return; }

      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    await supabase.from("project_messages").insert([{
      project_id: id,
      user_id: user.id,
      message: msgText,
      image_url: imageUrl,
    }]);

    setMsgText("");
    clearImage();
    fetchMessages();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pp-root">
        <div className="pp-inner">
          {project ? (
            <>
              <div className="pp-header">
                <h2>{project.title}</h2>
                {project.description && <p>{project.description}</p>}
              </div>

              <p className="section-label">Community</p>

              <div className="community-section">
                {/* Feed */}
                <div className="messages-feed" ref={feedRef}>
                  {messages.length === 0 ? (
                    <div className="feed-empty">
                      <div className="empty-icon">◻</div>
                      <p>No activity yet — be the first to post.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="message-item">
                        <span className="message-author" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {m.profiles?.avatar_url ? (
                            <img src={m.profiles.avatar_url} alt="avatar" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                              {m.profiles?.name ? m.profiles.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          {m.profiles?.name || "User"}
                        </span>
                        <div className="message-bubble">
                          {m.message && (
                            <span className="message-text">{m.message}</span>
                          )}
                          {m.image_url && (
                            <img
                              src={m.image_url}
                              alt="post"
                              className="message-img"
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Composer */}
                <div className="composer">
                  <div className="composer-text-row">
                    <input
                      className="composer-input"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Share an update or message…"
                    />
                    <button className="btn-post" onClick={sendMessage}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Post
                    </button>
                  </div>

                  <div className="composer-attach-row">
                    <label className="file-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Attach image
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="file-input-hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {imagePreview && (
                      <div className="image-preview-wrap">
                        <img src={imagePreview} alt="preview" className="image-preview" />
                        <button className="preview-remove" onClick={clearImage}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <SkeletonLoader type="page" />
          )}
        </div>
      </div>
    </>
  );
}