import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const initialStories = [
  {
    id: 1,
    name: "Ahmed",
    city: "Khartoum",
    story: "This is a story about how our community came together to rebuild.",
    votes: 5,
  },
  {
    id: 2,
    name: "Fatima",
    city: "Omdurman",
    story: "We faced many challenges but hope is still alive.",
    votes: 3,
  },
  {
    id: 3,
    name: "Mohamed",
    city: "Port Sudan",
    story: "Local initiatives helped restore water supply after the war.",
    votes: 8,
  },
];

export default function Stories() {
  const [stories, setStories] = useState(initialStories);
  const [activeVotes, setActiveVotes] = useState({});
  const [showForm, setShowForm] = useState(false);

  const handleVote = (id, type) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === id) {
          let newVotes = story.votes;
          const prevActive = activeVotes[id];

          if (prevActive === type) {
            newVotes = type === "up" ? story.votes - 1 : story.votes + 1;
            setActiveVotes((a) => ({ ...a, [id]: null }));
          } else {
            if (prevActive === "up" && type === "down") {
              newVotes = story.votes - 2;
            } else if (prevActive === "down" && type === "up") {
              newVotes = story.votes + 2;
            } else {
              newVotes = type === "up" ? story.votes + 1 : story.votes - 1;
            }
            setActiveVotes((a) => ({ ...a, [id]: type }));
          }
          return { ...story, votes: newVotes };
        }
        return story;
      })
    );
  };

  return (
    <>
      <Header />
      
      <main className="container my-5">
        <h1 className="text-white mb-4">Community Stories</h1>

        {/* Show Form Button */}
        <div className="mt-3 mb-4">
          <button
            className="btn sucess px-4 py-2"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Cancel" : "Share Your Story"}
          </button>
        </div>


         {/* Form Section */}
        {showForm && (
          <section className="my-5">
            <div
              className="p-4 rounded-4 text-white mx-auto"
              style={{
                maxWidth: "600px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <form>
                <div className="mb-3">
                  <label className="form-label">Your Area / Village</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Haj Yousif"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Your Story</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Write your story here..."
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label">Upload Image (optional)</label>
                  <input type="file" className="form-control" accept="image/*" />
                </div>

                <button type="submit" className="btn sucess px-4 py-2">
                  Submit Story
                </button>
              </form>
            </div>
          </section>
        )}


        {/* Story Boxes */}
        <div className="d-flex flex-column gap-4">
          {stories.map(({ id, name, city, story, votes }) => {
            const active = activeVotes[id] || null;

            return (

              
              <div
                key={id}
                className="story-box p-4 rounded-4"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                }}
              >
                
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>{name}</strong> — <em>{city}</em>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      aria-label="Upvote"
                      onClick={() => handleVote(id, "up")}
                      className={`vote-btn ${active === "up" ? "active-up" : ""}`}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.4rem",
                        color: active === "up" ? "#6d67ea" : "#bbb",
                        transition: "color 0.3s ease",
                      }}
                    >
                      <FaArrowUp />
                    </button>
                    <span style={{ minWidth: "24px", textAlign: "center" }}>
                      {votes}
                    </span>
                    <button
                      aria-label="Downvote"
                      onClick={() => handleVote(id, "down")}
                      className={`vote-btn ${active === "down" ? "active-down" : ""}`}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.4rem",
                        color: active === "down" ? "#e04c4c" : "#bbb",
                        transition: "color 0.3s ease",
                      }}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </div>
                <p style={{ whiteSpace: "pre-wrap" }}>{story}</p>
              </div>
            );
          })}
        </div>

        

        

       
      </main>
      
      <Footer />
    </>
  );
}
