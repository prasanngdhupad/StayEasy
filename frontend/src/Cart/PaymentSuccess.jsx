import React, { useEffect } from "react";
import "../CartStyles/PaymentSuccess.css";
import { Link, useSearchParams } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearCart } from "../features/cart/cartSlice";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const dispatch = useDispatch();

  useEffect(() => {
    toast.success("Booking Confirmed Successfully", {
      position: "top-center",
      autoClose: 3000,
    });

    dispatch(clearCart());
    sessionStorage.removeItem("orderItem");
  }, [dispatch]);

  return (
    <>
      <PageTitle title="Payment Status" />
      <NavBar />

      <div className="payment-success-container">
        <div className="success-content">
          <div className="success-icon">
            <div className="checkmark"></div>
          </div>

          <h1>Booking Confirmed!</h1>
          <p className="success-para">
            Your payment was successful. Reference ID{" "}
            <strong>{reference}</strong>
          </p>

          <Link className="explore-btn" to="/orders/user">
            View My Bookings
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default PaymentSuccess;
