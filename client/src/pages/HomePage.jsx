import React from "react";
import "./Homepage.css";

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>Seabird Alumni Presents Mini Olympiad</h1>
        <p>Challenge your knowledge, skills, and teamwork in our 3-round competition!</p>
      </section>

      <section className="about">
        <h2>About the Event</h2>
        <div>
          <p>This Mini Olympiad consists of three exciting rounds:</p>
          <ul>
            <li>Round 1: General Knowledge</li>
            <li>Round 2: Syllabus-based Questions</li>
            <li>Round 3: Presentation-based Round</li>
          </ul>
          <p>Judges will score the presentations, and voters from the audience can vote for their favorite teams.</p>
        </div>
      </section>

      <section className="features">
        <h2>Highlights</h2>
        <ul>
          <li>Participate in teams of 4 from your school</li>
          <li>Special judging panel for fair scoring</li>
          <li>Audience voting for extra points</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
