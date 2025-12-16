import React, { useEffect } from "react";
import "../AdminStyles/Dashboard.css";
import {
  AddBox,
  AttachMoney,
  CheckCircle,
  Dashboard as DashboardIcon,
  Error,
  Instagram,
  Inventory,
  LinkedIn,
  People,
  ShoppingCart,
  Star,
  YouTube,
} from "@mui/icons-material";
import NavBar from "../components/NavBar";
import PageTitle from "../components/PageTitle";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts } from "../features/admin/adminSlice";
import { getAllOrders } from "../features/order/orderSlice";

function Dashboard() {
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.admin);
const { orders, totalRevenue } = useSelector((state) => state.order);


  /* ================= FETCH DATA ================= */
  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(getAllOrders());
  }, [dispatch]);

  /* ================= CALCULATIONS ================= */
  const totalProducts = products?.length || 0;

  const outOfStock = products?.filter(
    (p) => p.availableBeds === 0
  ).length;

  const inStock = products?.filter(
    (p) => p.availableBeds > 0
  ).length;

  const totalReviews = products?.reduce(
    (acc, p) => acc + (p.reviewCount || 0),
    0
  );

  const totalOrders = orders?.length || 0;

  return (
    <>
      <NavBar />
      <PageTitle title="Admin Dashboard" />

      <div className="dashboard-container">
        {/* ================= SIDEBAR ================= */}
        <div className="sidebar">
          <div className="logo">
            <DashboardIcon className="logo-icon" />
            Admin Dashboard
          </div>

          <nav className="nav-menu">
            <div className="nav-section">
              <h3>Properties</h3>

              <Link to="/admin/products">
                <Inventory className="nav-icon" />
                All Properties
              </Link>

              <Link to="/admin/product/create">
                <AddBox className="nav-icon" />
                Create Property
              </Link>
            </div>

            <div className="nav-section">
              <h3>Users</h3>
              <Link to="/admin/users">
                <People className="nav-icon" />
                All Users
              </Link>
            </div>

            <div className="nav-section">
              <h3>Bookings</h3>
              <Link to="/admin/orders">
                <ShoppingCart className="nav-icon" />
                All Bookings
              </Link>
            </div>

            <div className="nav-section">
              <h3>Reviews</h3>
              <Link to="/admin/reviews">
                <Star className="nav-icon" />
                All Reviews
              </Link>
            </div>
          </nav>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="main-content">
          <div className="stats-grid">
            <div className="stat-box">
              <Inventory className="icon" />
              <h3>Total Properties</h3>
              <p>{totalProducts}</p>
            </div>

            <div className="stat-box">
              <ShoppingCart className="icon" />
              <h3>Total Bookings</h3>
              <p>{totalOrders}</p>
            </div>

            <div className="stat-box">
              <Star className="icon" />
              <h3>Total Reviews</h3>
              <p>{totalReviews}</p>
            </div>

            <div className="stat-box">
              <AttachMoney className="icon" />
              <h3>Total Revenue</h3>
              <p>₹{totalRevenue}</p>
            </div>

            <div className="stat-box">
              <Error className="icon" />
              <h3>Out Of Stock</h3>
              <p>{outOfStock}</p>
            </div>

            <div className="stat-box">
              <CheckCircle className="icon" />
              <h3>In Stock</h3>
              <p>{inStock}</p>
            </div>
          </div>

          {/* ================= SOCIAL (STATIC) ================= */}
          <div className="social-stats">
            <div className="social-box instagram">
              <Instagram />
              <h3>Instagram</h3>
              <p>123k Followers</p>
              <p>12 posts</p>
            </div>

            <div className="social-box linkedin">
              <LinkedIn />
              <h3>LinkedIn</h3>
              <p>15k Followers</p>
              <p>6 posts</p>
            </div>

            <div className="social-box youtube">
              <YouTube />
              <h3>YouTube</h3>
              <p>75k Followers</p>
              <p>100 posts</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
