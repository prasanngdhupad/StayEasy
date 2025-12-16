import React from "react";
import "../CartStyles/Payment.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CheckoutPath from "./CheckoutPath";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function Payment() {
  const { user } = useSelector((state) => state.user);
  const { shippingInfo } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  // Assumes 'orderItem' containing the Mongoose ID (bookingId) was saved 
  // after successfully calling createNewOrder in the previous step.
  const orderItem = JSON.parse(sessionStorage.getItem("orderItem"));

  const completePayment = async (amount) => {
    try {
      // Get Razorpay key
      const { data: keyData } = await axios.get("/api/getKey", {
        withCredentials: true,
      });
      const { key } = keyData;

      // Create Razorpay order (This creates the Razorpay ID, not the Mongoose Order)
      const { data: orderData } = await axios.post(
        "/api/payment/process",
        { amount },
        { withCredentials: true }
      );

      const { order } = orderData;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "PG / Hostel Booking",
        description: "Booking Payment",
        order_id: order.id,

        handler: async function (response) {
          // 🎯 CRITICAL: Send the Mongoose Order ID (bookingId) to the backend for update.
          const { data } = await axios.post(
            "/api/paymentVerification",
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: orderItem.bookingId, 
            },
            { withCredentials: true }
          );

          if (data.success) {
            navigate(
              `/paymentSuccess?reference=${response.razorpay_payment_id}`
            );
          } else {
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: user.name,
          email: user.email,
          contact: shippingInfo.phoneNumber,
        },

        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <PageTitle title="Payment Processing" />
      <NavBar />
      <CheckoutPath activePath={2} />

      <div className="payment-container">
        <Link to="/order/confirm" className="payment-go-back">
          Go Back
        </Link>

        <button
          className="payment-btn"
          onClick={() => completePayment(orderItem.totalRent)}
        >
          Pay ₹{orderItem.totalRent}
        </button>
      </div>

      <Footer />
    </>
  );
}

export default Payment;