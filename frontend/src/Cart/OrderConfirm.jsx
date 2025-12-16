import React from "react";
import "../CartStyles/OrderConfirm.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import CheckoutPath from "./CheckoutPath";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function OrderConfirm() {
  const { shippingInfo, cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);

  // Total rent = monthly rent × stay duration
  const totalRent = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const navigate = useNavigate();

  const proceedToPayment = async () => {
    try {
      const orderData = {
        tenantInfo: {
          fullName: user.name, // ✅ REQUIRED by schema
          phoneNumber: shippingInfo.phoneNumber,
          email: user.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          pinCode: shippingInfo.pinCode,
        },

        bookingItems: cartItems.map((item) => ({
          property: item.product,
          propertyTitle: item.name,
          roomType: "Standard",
          monthlyRent: item.price,
          image: item.image,
          stayDurationMonths: item.quantity,
        })),
        rentAmount: totalRent,
        securityDeposit: 0,
        maintenanceCharges: 0,
        totalAmount: totalRent,
        checkInDate: new Date(),
      };

      // 🔥 CREATE BOOKING FIRST
      const { data } = await axios.post("/api/order/new", orderData, {
        withCredentials: true,
      });

      // 🔥 SAVE bookingId
      sessionStorage.setItem(
        "orderItem",
        JSON.stringify({
          totalRent,
          bookingId: data.booking._id,
        })
      );

      navigate("/process/payment");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed", {
        position: "top-center",
      });
    }
  };
  return (
    <>
      <PageTitle title="Confirm Booking" />
      <NavBar />
      <CheckoutPath activePath={1} />

      <div className="confirm-container">
        <h1 className="confirm-header">Booking Confirmation</h1>

        <div className="confirm-table-container">
          {/* ================= TENANT DETAILS ================= */}
          <table className="confirm-table">
            <caption>Tenant Details</caption>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{user.name}</td>
                <td>{shippingInfo.phoneNumber}</td>
                <td>
                  {shippingInfo.address}, {shippingInfo.city},{" "}
                  {shippingInfo.state}, {shippingInfo.pinCode}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ================= BOOKING ITEMS ================= */}
          <table className="confirm-table cart-table">
            <caption>Booked Properties</caption>
            <thead>
              <tr>
                <th>Image</th>
                <th>Property Name</th>
                <th>Monthly Rent</th>
                <th>Stay (Months)</th>
                <th>Total Rent</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.product}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="product-image"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ================= SUMMARY ================= */}
          <table className="confirm-table">
            <caption>Booking Summary</caption>
            <thead>
              <tr>
                <th>Total Rent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>₹{totalRent}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button className="proceed-button" onClick={proceedToPayment}>
          Proceed to Payment
        </button>
      </div>

      <Footer />
    </>
  );
}

export default OrderConfirm;
