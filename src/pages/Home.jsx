import { useState } from "react";
import CreatePost from "../components/CreatePost";
import Feed from "../components/Feed";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg: #f5f0e8;
    --surface: #faf7f2;
    --border: #e2d9cc;
    --ink: #1a1612;
    --ink-muted: #7a6f63;
    --accent: #c8441a;
    --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  body.dark {
    --bg: #1a1612;
    --surface: #221e19;
    --border: #2e2720;
    --ink: #f0ebe2;
    --ink-muted: #9a8f83;
  }

  .home-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    display: flex;
    justify-content: center;
    padding: 80px 24px 80px;
  }

  .home-inner {
    width: 100%;
    max-width: 1000px;
  }

  .home-header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding-bottom: 24px;
    border-bottom: 1.5px solid var(--border);
    margin-bottom: 20px;
  }

  .home-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
  }

  .header-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
  }

  /* 🔥 SEARCH STYLE */
  .search-filters-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .search-bar {
    display: flex;
    gap: 10px;
  }

  .search-bar input {
    flex: 1;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: none;
    font-family: inherit;
  }

  .search-bar button {
    padding: 10px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
  }

  /* 🔥 FILTERS BAR */
  .filters-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .filters-bar select {
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: none;
    background: var(--surface);
    color: var(--ink);
    font-family: inherit;
    font-size: 0.95rem;
    cursor: pointer;
    transition: var(--transition);
    flex: 1;
    min-width: 150px;
  }

  .filters-bar select:hover {
    border-color: var(--ink-muted);
  }
`;

const Home = () => {
  const [refresh, setRefresh] = useState(false);

  // 🔥 SEARCH STATES
  const [searchText, setSearchText] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");

  // 🔥 FILTER STATES
  const [category, setCategory] = useState("All");
  const [topic, setTopic] = useState("All");
  const [sort, setSort] = useState("latest");

  const handleRefresh = () => setRefresh((prev) => !prev);

  const handleSearch = () => {
    setSearchTrigger(searchText);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">
        <div className="home-inner">

          {/* Header */}
          <div className="home-header">
            <h2>Dashboard</h2>
            <div className="header-dot" />
          </div>

          {/* 🔥 SEARCH & FILTERS */}
          <div className="search-filters-container">
            <div className="search-bar">
              <input
                placeholder="Search posts by username..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button onClick={handleSearch}>Search</button>
            </div>

            <div className="filters-bar">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">Category: All</option>
                <option value="Discussion">Discussion</option>
                <option value="Question">Question</option>
                <option value="Help Request">Help Request</option>
                <option value="Feedback">Feedback</option>
                <option value="Collaboration">Collaboration</option>
                <option value="Project Update">Project Update</option>
              </select>

              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="All">Topic: All</option>
                <option value="Design">Design</option>
                <option value="Technology">Technology</option>
                <option value="Startups">Startups</option>
                <option value="Marketing">Marketing</option>
                <option value="AI">AI</option>
                <option value="Growth">Growth</option>
              </select>

              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">Sort: Latest</option>
                <option value="top">Sort: Top</option>
                <option value="most_replies">Sort: Most Replies</option>
              </select>
            </div>
          </div>

          {/* Create Post */}
          <CreatePost onPostCreated={handleRefresh} />

          {/* Feed */}
          <Feed 
            refresh={refresh} 
            search={searchTrigger} 
            category={category} 
            topic={topic} 
            sort={sort} 
          />

        </div>
      </div>
    </>
  );
};

export default Home;