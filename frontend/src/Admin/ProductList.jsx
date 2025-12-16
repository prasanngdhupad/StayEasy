import React, { useEffect } from "react";
import "../AdminStyles/ProductsList.css";
import NavBar from "../components/NavBar";
import PageTitle from "../components/PageTitle";
import Footer from "../components/Footer";
import Loader from "../components/Loader.jsx";
import { Link } from "react-router-dom";
import { Delete, Edit } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  fetchAdminProducts,
  removeErrors,
  removeSuccess,
} from "../features/admin/adminSlice.js";
import { toast } from "react-toastify";

function ProductList() {
  const { products = [], loading, error, deleting = {} } = useSelector(
    (state) => state.admin
  );

  const dispatch = useDispatch();

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  /* ================= ERROR ================= */
  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  /* ================= DELETE ================= */
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      dispatch(deleteProduct(productId)).then((action) => {
        if (action.type === "admin/deleteProduct/fulfilled") {
          toast.success("Property Deleted Successfully", {
            position: "top-center",
            autoClose: 3000,
          });
          dispatch(removeSuccess());
        }
      });
    }
  };

  if (!products || products.length === 0) {
    return (
      <>
        <NavBar />
        <PageTitle title="All Properties" />
        <div className="product-list-container">
          <h1 className="product-list-title">Admin Properties</h1>
          <p className="no-admin-products">No Properties Found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <NavBar />
          <PageTitle title="All Properties" />
          <div className="product-list-container">
            <h1 className="product-list-title">All Properties</h1>

            <table className="product-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Rent / Month</th>
                  <th>Rating</th>
                  <th>Property Type</th>
                  <th>Available Beds</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>

                    <td>
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.title}
                        className="admin-product-image"
                      />
                    </td>

                    <td>{product.title}</td>

                    <td>₹{product.startingRent}</td>

                    <td>{product.averageRating || 0}</td>

                    <td>{product.propertyType}</td>

                    <td>{product.availableBeds}</td>

                    <td>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <Link
                        to={`/admin/product/${product._id}`}
                        className="action-icon edit-icon"
                      >
                        <Edit />
                      </Link>

                      <button
                        className="action-icon delete-icon"
                        disabled={deleting[product._id]}
                        onClick={() => handleDelete(product._id)}
                      >
                        {deleting[product._id] ? <Loader /> : <Delete />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

export default ProductList;
