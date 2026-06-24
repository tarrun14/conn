import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import PostCard from "./PostCard";
import SkeletonLoader from "./SkeletonLoader";

export default function Feed({ refresh, search, category, topic, sort }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [refresh, search, category, topic, sort]);

  const fetchPosts = async () => {
    setLoading(true);
    setErrorObj(null);
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles(name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      // 🔥 SEARCH FILTER
      if (search && search.trim() !== "") {
        const { data: users, error: userErr } = await supabase
          .from("profiles")
          .select("id")
          .ilike("name", `%${search}%`);

        if (userErr) throw userErr;

        if (users && users.length > 0) {
          const ids = users.map((u) => u.id);
          query = query.in("user_id", ids);
        } else {
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      } else {
        let result = data || [];

        // 🔥 EXTRACT ENCODED TAGS FROM CONTENT
        result = result.map((p) => {
          if (p.content && p.content.startsWith("{") && p.content.includes('"text"')) {
            try {
              const parsed = JSON.parse(p.content);
              return {
                ...p,
                content: parsed.text || "",
                category: parsed.category,
                topic: parsed.topic
              };
            } catch (e) {
              // Ignore parse errors, treat as raw text
            }
          }
          return p;
        });

        // 🔥 CATEGORY & TOPIC FILTERING
        if (category && category !== "All") {
          result = result.filter(p => p.category === category);
        }
        
        if (topic && topic !== "All") {
          result = result.filter(p => p.topic === topic);
        }

        // 🔥 SORTING (Top & Most Replies)
        if (sort === "top" || sort === "most_replies") {
          const [{ data: likesData }, { data: commentsData }] = await Promise.all([
            supabase.from("likes").select("post_id"),
            supabase.from("comments").select("post_id")
          ]);

          const likeCounts = {};
          likesData?.forEach(l => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1 });

          const commentCounts = {};
          commentsData?.forEach(c => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1 });

          result = result.map(p => ({
            ...p,
            _likes_count: likeCounts[p.id] || 0,
            _comments_count: commentCounts[p.id] || 0
          }));

          if (sort === "top") {
            result.sort((a, b) => b._likes_count - a._likes_count);
          } else if (sort === "most_replies") {
            result.sort((a, b) => b._comments_count - a._comments_count);
          }
        }

        setPosts(result);
      }
    } catch (err) {
      console.error("Network or parsing error catching posts:", err);
      setErrorObj(err.message || "Failed to load feed due to a network connection issue.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      {loading ? (
        <>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </>
      ) : errorObj ? (
        <div style={{ color: "var(--accent)", textAlign: "center", padding: "20px", background: "rgba(200,68,26,0.1)", borderRadius: "8px", border: "1px solid var(--accent)" }}>
          <p style={{ fontWeight: "600", marginBottom: "8px" }}>Network Action Failed</p>
          <p style={{ fontSize: "0.9rem" }}>{errorObj}</p>
          <button 
            onClick={fetchPosts} 
            style={{ marginTop: "12px", background: "var(--accent)", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p style={{ color: "var(--ink-muted)", fontStyle: "italic", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>
          {search ? "No posts found." : "No posts yet."}
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={() => handleDeletePost(post.id)}
          />
        ))
      )}
    </div>
  );
}