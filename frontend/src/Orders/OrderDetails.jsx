import React, { useEffect } from "react";
import "../OrderStyles/OrderDetails.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, removeErrors } from "../features/order/orderSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

function OrderDetails() {
  const { orderId } = useParams();
  const { order = {}, loading, error } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrderDetails(orderId));
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, orderId]);

  const {
    tenantInfo = {},
    bookingItems = [],
    paymentInfo = {},
    bookingStatus,
    totalAmount,
    rentAmount,
    securityDeposit,
    maintenanceCharges,
    paidAt,
  } = order;

  const paymentStatus = paymentInfo?.status === 'Paid' ? 'Paid' : 'Not Paid';
  const finalOrderStatus = paymentStatus === 'Not Paid' ? 'Pending' : bookingStatus;

  const orderStatusClass = finalOrderStatus === 'Completed' ? 'status-tag completed' : `status-tag ${finalOrderStatus.toLowerCase()}`;
  const paymentStatusClass = `pay-tag ${paymentStatus === 'Paid' ? 'paid' : 'not-paid'}`;

  return (
    <>
      <PageTitle title={orderId} />
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <div className="order-box">
          <div className="table-block">
            <h2 className="table-title">Booking Items</h2>
            {/* 🛑 FIX 1: Comment moved/removed from inside the <table> tag */}
            <table className="table-main">
              <thead>
                {/* 🛑 FIX 2: Ensure <tr> starts immediately with <th> with no surrounding whitespace/newlines */}
                <tr>
                  <th className="head-cell">Property Image</th>
                  <th className="head-cell">Property Name</th>
                  <th className="head-cell">Room Type</th> {/* Changed from Beds Booked, based on bookingItems structure */}
                  <th className="head-cell">Rent Price</th>
                </tr>
              </thead>
              <tbody>
                {bookingItems.map((item) => (
                  <tr className="table-row" key={item.property || item._id}>
                    <td className="table-cell">
                      <img src={item.image} alt={item.propertyTitle} className="item-img" />
                    </td>
                    <td className="table-cell">{item.propertyTitle}</td> 
                    <td className="table-cell">{item.roomType}</td> 
                    <td className="table-cell">{item.monthlyRent}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-block">
            <h2 className="table-title">Tenant Info</h2>
            <table className="table-main">
              <tbody>
                <tr className="table-row">
                  <th className="table-cell">Address</th>
                  <td className="table-cell">
                    {tenantInfo.address}, {tenantInfo.city}, {tenantInfo.state}, {tenantInfo.country}-{tenantInfo.pinCode}
                  </td>
                </tr>
                <tr className="table-row">
                  <th className="table-cell">Phone</th>
                  <td className="table-cell">{tenantInfo.phoneNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="table-block">
            <h2 className="table-title">Booking Summary</h2>
            <table className="table-main">
              <tbody>
                <tr className="table-row">
                  <th className="table-cell">Order Status</th>
                  <td className="table-cell">
                    <span className={orderStatusClass}>{finalOrderStatus}</span>
                  </td>
                </tr>
                <tr className="table-row">
                  <th className="table-cell">Payment</th>
                  <td className="table-cell">
                    <span className={paymentStatusClass}>{paymentStatus}</span>
                  </td>
                </tr>
                {paidAt && (
                  <tr className="table-row">
                    <th className="table-cell">Paid At</th>
                    <td className="table-cell">{new Date(paidAt).toLocaleString()}</td>
                  </tr>
                )}
                <tr className="table-row">
                  <th className="table-cell">Rent Amount</th>
                  <td className="table-cell">{rentAmount}</td>
                </tr>
                <tr className="table-row">
                  <th className="table-cell">Security Deposit</th>
                  <td className="table-cell">{securityDeposit}</td>
                </tr>
                <tr className="table-row">
                  <th className="table-cell">Maintenance Charges</th>
                  <td className="table-cell">{maintenanceCharges}</td>
                </tr>
                <tr className="table-row">
                  <th className="table-cell">Total Amount</th>
                  <td className="table-cell">{totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

export default OrderDetails;