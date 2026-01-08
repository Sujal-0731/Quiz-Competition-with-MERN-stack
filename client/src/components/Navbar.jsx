import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>Seabird Alumni Presents Mini Olympiad</h1>
      </div>
      <div className="navbar-right">
        <Link to="/register" className="nav-btn">Register</Link>
        <Link to="/login" className="nav-btn">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
