import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import "../componentStyles/Navbar.css";
import "../pageStyles/Search.css";
import { useSelector } from "react-redux";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { isAuthenticated } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/products?keyword=${encodeURIComponent(searchQuery.trim())}`
      );
    } else {
      navigate(`/products`);
    }
    setSearchQuery("");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-logo">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            StayEasy
          </Link>
        </div>

        {/* LINKS */}
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                Properties
              </Link>
            </li>
            <li>
              <Link to="/about-us" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact-us" onClick={() => setIsMenuOpen(false)}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* ICONS */}
        <div className="navbar-icons">
          {/* SEARCH */}
          <div className="search-container">
            <form
              className={`search-form ${isSearchOpen ? "active" : ""}`}
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                className="search-input"
                placeholder="Search PG, Hostel, Room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="search-icon"
              >
                <SearchIcon focusable="false" />
              </button>
            </form>
          </div>

          {/* BOOKING CART */}
          <div className="cart-container">
            <Link to="/cart">
              <ShoppingCartIcon className="icon" />
              <span className="cart-badge">{cartItems.length}</span>
            </Link>
          </div>

          {/* REGISTER */}
          {!isAuthenticated && (
            <Link to="/register" className="register-link">
              <PersonAddIcon className="icon" />
            </Link>
          )}

          {/* MOBILE MENU */}
          <div className="navbar-hamburger" onClick={toggleMenu}>
            {isMenuOpen ? (
              <CloseIcon className="icon" />
            ) : (
              <MenuIcon className="icon" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
