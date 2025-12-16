import React from "react";
import "../CartStyles/Cart.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CartItem from "./CartItem";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const { cartItems } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <>
      <NavBar />

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <p className="empty-cart-message">
            Your booking cart is empty
          </p>
          <Link to="/products" className="viewProducts">
            View Properties
          </Link>
        </div>
      ) : (
        <>
          <PageTitle title="Your Booking" />

          <div className="cart-page">
            {/* LEFT */}
            <div className="cart-items">
              <div className="cart-items-heading">
                Your Booking
              </div>

              <div className="cart-table">
                <div className="cart-table-header">
                  <div>Property</div>
                  <div>Stay (Months)</div>
                  <div>Total Rent</div>
                  <div>Actions</div>
                </div>

                {cartItems.map((item) => (
                  <CartItem
                    key={item.product}
                    item={item}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="price-summary">
              <h3 className="price-summary-heading">
                Booking Summary
              </h3>

              <div className="summary-item">
                <span>Rent Total</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="summary-item">
                <span>Tax</span>
                <span>₹0</span>
              </div>

              <div className="summary-item">
                <span>Other Charges</span>
                <span>₹0</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={checkoutHandler}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}

export default Cart;
