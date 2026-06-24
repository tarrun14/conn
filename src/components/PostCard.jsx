import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./PostCard.css";

export default function PostCard({ post, onDelete }) {
  const [user, setUser] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [following, setFollowing] = useState(false);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const [showComments, setShowComments] = useState(false);

  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      // ✅ Use getSession() instead of getUser() - avoids concurrent lock contention
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;

      if (!currentUser) return;

      setUser(currentUser);

      await fetchLikes();
      await checkLike(currentUser);
      await checkFollow(currentUser);
    };

    init();
  }, [post.id]);

  // ================= LIKE =================

  const fetchLikes = async () => {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id);

    setLikeCount(data?.length || 0);
  };

  const checkLike = async (currentUser) => {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("post_id", post.id);

    setLiked(data?.length > 0);
  };

  const handleLike = async () => {
    if (!user) return;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          user_id: user.id,
          post_id: post.id,
        },
      ]);

      if (!error) {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }
  };

  // ================= FOLLOW =================

  const checkFollow = async (currentUser) => {
  // ❌ prevent self follow check
  if (currentUser.id === post.user_id) {
    setFollowing(false);
    return;
  }

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", currentUser.id)
    .eq("following_id", post.user_id);

  setFollowing(data?.length > 0);
};

  const handleFollow = async () => {
  if (!user || user.id === post.user_id) return;

  console.log("CLICKED FOLLOW BUTTON");

  // 🔍 always check fresh data from DB
  const { data: existing, error: fetchError } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", post.user_id);

  console.log("EXISTING:", existing);

  if (existing && existing.length > 0) {
    // 👉 UNFOLLOW
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", post.user_id);

    console.log("DELETE ERROR:", error);

    if (!error) {
      setFollowing(false);
    }
  } else {
    // 👉 FOLLOW
    const { error } = await supabase.from("follows").insert([
      {
        follower_id: user.id,
        following_id: post.user_id,
      },
    ]);

    console.log("INSERT ERROR:", error);

    if (!error) {
      setFollowing(true);
    }
  }
};
  // ================= DELETE =================

  const handleDelete = async () => {
    if (!user) return;

    const confirmDelete = window.confirm("Delete this post?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      alert(error.message);
    } else {
      if (onDelete) onDelete();
    }
  };

  // ================= COMMENTS =================

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`*, profiles(name, avatar_url)`)
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const handleComment = async () => {
    if (!user || comment.trim() === "") return;

    const { error } = await supabase.from("comments").insert([
      {
        user_id: user.id,
        post_id: post.id,
        content: comment,
      },
    ]);

    if (!error) {
      setComment("");
      fetchComments();
    }
  };

  const toggleComments = async () => {
    if (!showComments) await fetchComments();
    setShowComments(!showComments);
  };

  // ================= IMAGE =================

  let images = [];

  if (post.image_urls?.length > 0) {
    images = post.image_urls;
  } else if (post.image_url) {
    images = [post.image_url];
  }

  // ================= 🔥 FINAL USERNAME FIX =================

  const username = post?.profiles?.name;

  // fallback ONLY if truly missing
  const displayName = username ? username : "User";

  // ================= UI =================

  return (
    <div className="post-card">

      {/* HEADER */}
      <div className="post-header">
        <div className="user-info">
          <div className="avatar" style={{ overflow: 'hidden' }}>
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              "👤"
            )}
          </div>
          <span className="username">{displayName}</span>
        </div>

        {user && user.id !== post.user_id && (
          <button className="follow-btn" onClick={handleFollow}>
            {following ? "Following" : "Follow"}
          </button>
        )}

        {user && user.id === post.user_id && (
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {/* TAGS */}
      {(post.category || post.topic) && (
        <div className="post-tags">
          {post.category && <span className="post-tag category-tag">{post.category}</span>}
          {post.topic && <span className="post-tag topic-tag">{post.topic}</span>}
        </div>
      )}

      {/* IMAGE */}
      {images.length > 0 && (
        <div className="post-image-container">
          {images.map((img, index) => (
            <img key={index} src={img} alt="post" />
          ))}
        </div>
      )}

      {/* LIKE */}
      <div className="post-actions">
        <button className="like-btn" onClick={handleLike}>
          {liked ? "❤️" : "🤍"} {likeCount}
        </button>
      </div>

      {/* COMMENTS */}
      <p className="view-comments-btn" onClick={toggleComments}>
        {showComments ? "Hide comments" : "Show comments"}
      </p>

      {showComments && (
        <>
          <div className="comments-container">
            {comments.slice(0, 4).map((c) => (
              <div key={c.id} className="comment-item">
                <span className="comment-user" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {c.profiles?.avatar_url ? (
                    <img src={c.profiles.avatar_url} alt="avatar" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--border)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                      {c.profiles?.name ? c.profiles.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  {c.profiles?.name || "User"}
                </span>
                : {c.content}
              </div>
            ))}
          </div>

          <div className="comment-box">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button onClick={handleComment}>Post</button>
          </div>
        </>
      )}
    </div>
  );
}