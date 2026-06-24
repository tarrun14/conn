export default function SkeletonLoader({ type = "card" }) {
  if (type === "page") {
    return (
      <div style={{ padding: "80px 24px", maxWidth: "1000px", margin: "0 auto", animation: "pulse 1.5s infinite ease-in-out" }}>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        <div style={{ height: "40px", width: "250px", background: "var(--border)", borderRadius: "8px", marginBottom: "30px" }} />
        
        {/* Placeholder Blocks */}
        <div style={{ height: "200px", width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "12px", marginBottom: "20px" }} />
        <div style={{ height: "200px", width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "12px", marginBottom: "20px" }} />
      </div>
    );
  }

  if (type === "block") {
    return (
      <div style={{
        background: "var(--surface)",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "16px",
        border: "1.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "pulse 1.5s infinite ease-in-out"
      }}>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        <div style={{ width: "60%", height: "24px", borderRadius: "6px", background: "var(--border)" }} />
        <div style={{ width: "100%", height: "12px", borderRadius: "4px", background: "var(--border)" }} />
        <div style={{ width: "80%", height: "12px", borderRadius: "4px", background: "var(--border)" }} />
      </div>
    );
  }

  // Default type: "card"
  return (
    <div style={{
      background: "var(--surface)",
      padding: "24px",
      borderRadius: "12px",
      marginBottom: "24px",
      border: "1.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      animation: "pulse 1.5s infinite ease-in-out"
    }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--border)" }} />
        <div style={{ width: "120px", height: "16px", borderRadius: "4px", background: "var(--border)" }} />
      </div>
      <div style={{ width: "100%", height: "12px", borderRadius: "4px", background: "var(--border)" }} />
      <div style={{ width: "80%", height: "12px", borderRadius: "4px", background: "var(--border)" }} />
      <div style={{ width: "60%", height: "12px", borderRadius: "4px", background: "var(--border)" }} />
    </div>
  );
}
