import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  .project-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 16px;
    transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
  }

  .project-card.clickable {
    cursor: pointer;
  }

  .project-card:hover {
    border-color: #c8b9a8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26,22,18,0.05);
  }

  .project-cover {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 16px;
    background: var(--bg);
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

  .project-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .project-desc {
    font-size: 0.9rem;
    color: var(--ink-muted);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .project-owner {
    font-size: 0.8rem;
    color: var(--ink-muted);
    margin-bottom: 16px;
  }

  .btn-follow {
    background: transparent;
    border: 1.5px solid var(--accent);
    color: var(--accent);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .btn-follow:hover {
    background: var(--accent);
    color: #fff;
  }

  .btn-follow.active {
    background: var(--accent);
    color: #fff;
  }

  .empty-msg {
    color: var(--ink-muted);
    font-size: 0.9rem;
    font-style: italic;
  }
`;

export default function ProjectHub() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUser(user);
      if (user) {
        fetchProjects(user);
      } else {
        setLoading(false);
      }
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ✅ SINGLE fetchProjects (removed duplicate)
  const fetchProjects = async (currentUser) => {
    const { data: projectsData } = await supabase
      .from("projects")
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    const { data: follows } = await supabase
      .from("project_followers")
      .select("project_id")
      .eq("user_id", currentUser.id);

    const followedIds = follows?.map((f) => f.project_id) || [];

    const merged = (projectsData || []).map((proj) => ({
      ...proj,
      isFollowing: followedIds.includes(proj.id),
    }));

    setProjects(merged);
    setLoading(false);
  };

  const followProject = async (e, projectId) => {
    if (e) e.stopPropagation();
    if (!user) return;

    const proj = projects.find((p) => p.id === projectId);
    if (!proj || proj.user_id === user.id) return;

    if (proj.isFollowing) return;

    const { error } = await supabase.from("project_followers").insert([
      {
        user_id: user.id,
        project_id: projectId,
      },
    ]);

    if (!error) {
      fetchProjects(user);
    }
  };

  const handleProjectClick = (proj) => {
    if (proj.isFollowing || proj.user_id === user?.id) {
      navigate(`/project/${proj.id}`);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <div className="page-inner">
          <div className="page-header">
            <h2>Project Hub</h2>
            <div className="dot" />
          </div>

          {loading ? (
             <SkeletonLoader type="page" />
          ) : projects.length === 0 ? (
            <p className="empty-msg">No projects yet</p>
          ) : (
            projects.map((proj) => {
              const canEnter = proj.isFollowing || proj.user_id === user?.id;
              return (
              <div 
                key={proj.id} 
                className={`project-card ${canEnter ? "clickable" : ""}`}
                onClick={() => handleProjectClick(proj)}
              >
                {proj.image_url && (
                  <img src={proj.image_url} alt="Cover" className="project-cover" />
                )}
                <div>
                  <span className={`project-tag tag-${(proj.status || 'idea').replace(' ', '-')}`}>
                    {proj.status || 'idea'}
                  </span>
                </div>
                <div className="project-title">
                  🚀 {proj.title}
                </div>
                
                <p className="project-desc">{proj.description}</p>

                <div className="project-owner" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '16px' }} onClick={(e) => { e.stopPropagation(); navigate(`/user/${proj.user_id}`); }}>
                  {proj.profiles?.avatar_url ? (
                    <img src={proj.profiles.avatar_url} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {proj.profiles?.name ? proj.profiles.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  {proj.profiles?.name || "User"}
                </div>

                {proj.user_id !== user?.id && (
                  <button
                    className={`btn-follow ${proj.isFollowing ? "active" : ""}`}
                    onClick={(e) => followProject(e, proj.id)}
                  >
                    {proj.isFollowing ? "Following" : "Follow Project"}
                  </button>
                )}
              </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}