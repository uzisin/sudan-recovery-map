import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import api from "./axiosConfig";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import areasData from "./data/areas.json";

// Build a sorted list of all areas (states + cities) from areas.json
const ALL_AREAS_SORTED = Array.from(
  new Set(
    Object.keys(areasData).flatMap((state) => [
      state,
      ...(areasData[state] || []),
    ])
  )
).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

export default function Stories() {
  const location = useLocation();

  // If coming from Profile with "edit story"
  const initialEditingStory =
    location.state?.edit && location.state.story ? location.state.story : null;

  const [stories, setStories] = useState([]);
  const [activeVotes, setActiveVotes] = useState({});
  const [expandedStories, setExpandedStories] = useState({});
  const [showForm, setShowForm] = useState(!!initialEditingStory);

  // Form state
  const [area, setArea] = useState(initialEditingStory?.city || "");
  const [storyText, setStoryText] = useState(
    initialEditingStory?.story || ""
  );
  const [imageFile, setImageFile] = useState(null);

  // Filter state
  const [filterArea, setFilterArea] = useState("All Areas");

  // Logged-in user from backend
  const [user, setUser] = useState(null);

  // Current story being edited (null when creating a new one)
  const [editingStory, setEditingStory] = useState(initialEditingStory);

  // Ask backend: who is the current user?
  useEffect(() => {
    api
      .get("/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // Load all stories from backend
  useEffect(() => {
    api
      .get("/stories")
      .then((res) => setStories(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Submit (create or update) story
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to share a story.");
      return;
    }

    const formData = new FormData();
    formData.append("city", area);
    formData.append("story", storyText);
    if (imageFile) formData.append("image", imageFile);

    try {
      const isEditing = !!editingStory;
      const url = isEditing ? `/stories/${editingStory.id}` : "/stories";
      const method = isEditing ? "put" : "post";

      const res = await api({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const saved = res.data;

      if (isEditing) {
        // Replace the edited story in the list
        setStories((prev) =>
          prev.map((s) => (s.id === editingStory.id ? saved : s))
        );
        alert("✅ Story updated successfully");
      } else {
        // Prepend new story
        setStories((prev) => [saved, ...prev]);
        alert("✅ Story submitted successfully");
      }

      // Reset form and editing state
      setArea("");
      setStoryText("");
      setImageFile(null);
      setEditingStory(null);
      setShowForm(false);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to submit story");
    }
  };

  // Voting handler (backend controls logic)
  const handleVote = async (id, type) => {
    if (!user) {
      alert("You must be logged in to vote.");
      return;
    }

    try {
      const res = await api.post(`/stories/${id}/vote`, { type });

      const { votes, user_vote } = res.data;

      // Update story votes
      setStories((prevStories) =>
        prevStories.map((story) =>
          story.id === id ? { ...story, votes } : story
        )
      );

      // Update local vote state (up/down/null)
      setActiveVotes((prev) => ({
        ...prev,
        [id]: user_vote,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle read more / less
  const toggleExpand = (id) => {
    setExpandedStories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Build filter options from existing stories
  const areaOptions = [
    "All Areas",
    ...Array.from(
      new Set(stories.map((s) => s.city).filter((c) => c?.trim() !== ""))
    ).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
  ];

  const filteredStories =
    filterArea === "All Areas"
      ? stories
      : stories.filter((s) => s.city === filterArea);

  // Image preview: prefer newly chosen file, otherwise keep existing image when editing
  let previewUrl = null;
  if (imageFile) {
    previewUrl = URL.createObjectURL(imageFile);
  } else if (editingStory && editingStory.image) {
    previewUrl = `http://127.0.0.1:8000/storage/${editingStory.image}`;
  }

  return (
    <>
      <Header />

      <main className="container my-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <h1 className="text-white mb-0">Community Stories</h1>

          {/* Filter dropdown */}
          <div className="d-flex flex-column flex-sm-row gap-2">
            <label className="text-white mb-0">Filter by Area:</label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="form-select"
              style={{
                maxWidth: "220px",
                background: "rgba(0,0,0,0.5)",
                color: "white",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              {areaOptions.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info for guests */}
        {!user && (
          <p className="text-white mb-3" style={{ opacity: 0.8 }}>
            You can browse all community stories.{" "}
            <span style={{ fontStyle: "italic" }}>
              Login to share your story or vote.
            </span>
          </p>
        )}

        {/* Show form button (only for logged-in users) */}
        {user && (
          <button
            className="btn sucess px-4 py-2 mb-4"
            onClick={() => {
              // If user manually opens the form for a new story, clear editing
              if (!showForm || editingStory) {
                setEditingStory(null);
                setArea("");
                setStoryText("");
                setImageFile(null);
              }
              setShowForm((prev) => !prev);
            }}
          >
            {showForm
              ? editingStory
                ? "Cancel Editing"
                : "Cancel"
              : "Share Your Story"}
          </button>
        )}

        {/* Add / Edit Story Form */}
        {user && showForm && (
          <div
            className="p-4 rounded-4 text-white mx-auto mb-5"
            style={{
              maxWidth: "650px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h5 className="mb-3">
              {editingStory ? "Edit Your Story" : "Share Your Story"}
            </h5>

            <form onSubmit={handleSubmit}>
              <label className="form-label">Your Area / Village</label>
              <select
                className="form-select mb-3"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              >
                <option value="">Select area</option>
                {ALL_AREAS_SORTED.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <label className="form-label">Your Story</label>
              <textarea
                className="form-control mb-3"
                rows="5"
                placeholder="Write your story here..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                required
              ></textarea>

              <label className="form-label">Upload Image (optional)</label>
              <input
                type="file"
                className="form-control mb-3"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mb-3"
                  style={{ width: "100%", borderRadius: "12px" }}
                />
              )}

              <button className="btn sucess px-4 py-2" type="submit">
                {editingStory ? "Update Story" : "Submit Story"}
              </button>
            </form>
          </div>
        )}

        {/* Stories List */}
        <div className="d-flex flex-column gap-4">
          {filteredStories.map((story) => {
            const isExpanded = expandedStories[story.id] || false;
            const active = activeVotes[story.id] || null;
            const limit = 180;
            const body = story.story || "";

            const text =
              body.length > limit && !isExpanded
                ? body.slice(0, limit) + "..."
                : body;

            return (
              <div
                key={story.id}
                className="p-4 rounded-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >
                {/* Image */}
                {story.image && (
                  <img
                    src={`http://127.0.0.1:8000/storage/${story.image}`}
                    alt="Story"
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      maxHeight: "260px",
                      objectFit: "cover",
                      marginBottom: "12px",
                    }}
                  />
                )}

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>{story.user?.name || "User"}</strong> —{" "}
                    <em>{story.city}</em>
                  </div>

                  {/* Votes (only logged-in users can vote) */}
                  {user ? (
                    <div className="d-flex align-items-center gap-3">
                      <button
                        onClick={() => handleVote(story.id, "up")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: active === "up" ? "#7b74ff" : "#bbb",
                          fontSize: "1.4rem",
                          cursor: "pointer",
                        }}
                      >
                        <FaArrowUp />
                      </button>

                      <span
                        style={{ minWidth: "24px", textAlign: "center" }}
                      >
                        {story.votes}
                      </span>

                      <button
                        onClick={() => handleVote(story.id, "down")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: active === "down" ? "#ff6d6d" : "#bbb",
                          fontSize: "1.4rem",
                          cursor: "pointer",
                        }}
                      >
                        <FaArrowDown />
                      </button>
                    </div>
                  ) : (
                    <span style={{ opacity: 0.6, fontSize: "0.9rem" }}>
                      Login to vote
                    </span>
                  )}
                </div>

                {/* Story Text */}
                <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>

                {body.length > limit && (
                  <button
                    onClick={() => toggleExpand(story.id)}
                    className="btn btn-sm mt-2"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9fd4ff",
                      paddingLeft: 0,
                    }}
                  >
                    {isExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}
