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
  }

  .page-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    padding: 80px 24px 80px;
  }

  .page-inner {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
  }

  .page-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
  }

  .page-header .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
    margin-bottom: 4px;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin: 32px 0 16px;
  }

  .list-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.05rem;
    font-weight: 500;
  }

  .list-card:hover {
    border-color: #c8b9a8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26,22,18,0.05);
  }

  .empty-msg {
    color: var(--ink-muted);
    font-size: 0.9rem;
    font-style: italic;
  }
`;

export default function Following() {
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [projectFollowing, setProjectFollowing] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

    if (!currentUser) return;

    setUser(currentUser);

    await Promise.all([
      fetchFollowing(currentUser.id),
      fetchProjectFollowing(currentUser.id)
    ]);
    
    setLoading(false);
    } catch(err) {
      console.error("Session error:", err);
      setLoading(false);
    }
  };

  // 🔥 FETCH FOLLOWING USERS
  const fetchFollowing = async (userId) => {
    const { data, error } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", userId);

    if (error) {
      console.log(error);
      return;
    }

    if (!data || data.length === 0) {
      setFollowing([]);
      return;
    }

    const ids = data.map((f) => f.following_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", ids);

    const merged = data.map((f) => ({
      ...f,
      profiles: profiles?.find((p) => p.id === f.following_id),
    }));

    setFollowing(merged);
  };

  // 🔥 FETCH FOLLOWED PROJECTS (NEW)
  const fetchProjectFollowing = async (userId) => {
    const { data, error } = await supabase
      .from("project_followers")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.log(error);
      return;
    }

    if (!data || data.length === 0) {
      setProjectFollowing([]);
      return;
    }

    const ids = data.map((p) => p.project_id);

    const { data: projects } = await supabase
      .from("projects")
      .select("id, title")
      .in("id", ids);

    const merged = data.map((p) => ({
      ...p,
      project: projects?.find((proj) => proj.id === p.project_id),
    }));

    setProjectFollowing(merged);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <div className="page-inner">
          <div className="page-header">
            <h2>Following</h2>
            <div className="dot" />
          </div>

          {/* 🔥 USERS */}
          <div className="section-label">Users</div>

          {loading ? (
             <>
               <SkeletonLoader type="block" />
               <SkeletonLoader type="block" />
             </>
          ) : following.length === 0 ? (
            <p className="empty-msg">No users followed</p>
          ) : (
            following.map((f, index) => (
              <div
                key={index}
                className="list-card"
                onClick={() => navigate(`/user/${f.following_id}`)}
              >
                {f.profiles?.avatar_url ? (
                  <img src={f.profiles.avatar_url} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {f.profiles?.name ? f.profiles.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                {f.profiles?.name || "User"}
              </div>
            ))
          )}

          {/* 🔥 PROJECTS */}
          <div className="section-label">Projects</div>

          {loading ? (
             <>
               <SkeletonLoader type="block" />
               <SkeletonLoader type="block" />
             </>
          ) : projectFollowing.length === 0 ? (
            <p className="empty-msg">No projects followed</p>
          ) : (
            projectFollowing.map((p, index) => (
              <div
                key={index}
                className="list-card"
                onClick={() => navigate(`/project/${p.project_id}`)}
              >
                🚀 {p.project?.title || "Project"}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}