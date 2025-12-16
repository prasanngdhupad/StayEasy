import React, { useEffect, useState } from "react";
import "../pageStyles/ProductDetails.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Rating from "../components/Rating";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  createReview,
  getProductDetails,
  removeErrors,
  removeSuccess,
} from "../features/products/productSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { addItemsToCart, removeMessage } from "../features/cart/cartSlice";

function ProductDetails() {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [quantity, setQuantity] = useState(1); // stay duration (months)
  const [selectedImage, setSelectedImage] = useState(null);
  // NEW STATE: To hold the currently selected room type/rent { type: string, rent: number }
  const [selectedRoom, setSelectedRoom] = useState(null); 

  const dispatch = useDispatch();
  const { id } = useParams();

  const { loading, error, product, reviewSuccess, reviewLoading } =
    useSelector((state) => state.product);

  const {
    loading: cartLoading,
    error: cartError,
    success,
    message,
  } = useSelector((state) => state.cart);

  // === Logic for Room Rent Details (Moved outside useEffect for accessibility) ===
  const { roomTypes = {} } = product || {};
  const roomRentDetails = [
    { type: "Single Sharing", rent: roomTypes.single },
    { type: "Twin Sharing", rent: roomTypes.twin },
    { type: "Triple Sharing", rent: roomTypes.triple },
    { type: "Four Sharing", rent: roomTypes.fourSharing },
  ].filter(detail => typeof detail.rent === "number" && detail.rent > 0);

  // =========================================


  /* ================= FETCH PROPERTY & AUTO-SELECT ROOM ================= */
  useEffect(() => {
    if (id) dispatch(getProductDetails(id));
    return () => dispatch(removeErrors());
  }, [dispatch, id]);

  // New useEffect to set the initial selected room to the cheapest/first one
  useEffect(() => {
  if (!selectedRoom && roomRentDetails.length > 0) {
    setSelectedRoom(roomRentDetails[0]);
  }
}, [roomRentDetails.length]);



  /* ================= ERRORS & SUCCESS ================= */
  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
    if (cartError) {
      toast.error(cartError, { position: "top-center", autoClose: 3000 });
    }
  }, [dispatch, error, cartError]);

  useEffect(() => {
    if (success) {
      toast.success(message, { position: "top-center", autoClose: 3000 });
      dispatch(removeMessage());
    }
  }, [dispatch, success, message]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully", {
        position: "top-center",
        autoClose: 3000,
      });
      setUserRating(0);
      setComment("");
      dispatch(removeSuccess());
      dispatch(getProductDetails(id));
    }
  }, [reviewSuccess, dispatch, id]);

  /* ================= IMAGE HANDLING ================= */
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0].url);
    }
  }, [product]);

  /* ================= VIEW MAP (CORRECTED) ================= */
  const openMap = () => {
    const lat = product?.latitude;
    const long = product?.longitude;
    let mapUrl = "";

    if (lat && long) {
      // Correct Google Maps URL format for coordinates: ?query=lat,long
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
    } else if (
      product?.fullAddress ||
      product?.city ||
      product?.locality
    ) {
      const address = [
        product.fullAddress,
        product.locality,
        product.city,
      ]
        .filter(Boolean)
        .join(", ");

      // Correct Google Maps URL format for searching an address
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    if (mapUrl) {
      window.open(mapUrl, "_blank");
    } else {
      toast.error("Location data (coordinates or address) is not available.");
    }
  };

  /* ================= QUANTITY & CART ================= */
  const decreaseQty = () => {
    if (quantity <= 1) {
      toast.error("Stay duration cannot be less than 1 month");
      return;
    }
    setQuantity((q) => q - 1);
  };

  const increaseQty = () => {
    if (product.availableBeds <= 0) {
      toast.error("No beds available");
      return;
    }
    setQuantity((q) => q + 1);
  };

  // ... in ProductDetails.jsx

  const addToCart = () => {
  if (!selectedRoom) {
    toast.error("Please select a room sharing type first.");
    return;
  }

  dispatch(
    addItemsToCart({
      id: product._id,
      name: product.title,                    // ✅ This sends the title
      image: product.images?.[0]?.url || "",  // ✅ This sends the main image URL
      price: selectedRoom.rent,
      roomType: selectedRoom.type,
      quantity,
    })
  );
};


  /* ================= REVIEW SUBMIT ================= */
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!userRating) {
      toast.error("Please select a rating");
      return;
    }
    dispatch(
      createReview({
        rating: userRating,
        comment,
        productId: id,
      })
    );
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Loader />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <NavBar />
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageTitle title={`${product.title} - Details`} />
      <NavBar />

      <div className="product-details-container">
        <div className="product-detail-container">
          {/* ================= IMAGES ================= */}
          <div className="product-image-container">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="product-detail-image"
              />
            ) : (
              <div className="product-detail-image placeholder">
                No image available
              </div>
            )}

            {product.images?.length > 0 && (
              <div className="product-thumbnails">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt="thumbnail"
                    className="thumbnail-image"
                    onClick={() => setSelectedImage(img.url)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ================= INFO ================= */}
          <div className="product-info">
            <h2>{product.title}</h2>
            <p className="product-description">{product.description}</p>
              {/* ================= AMENITIES ================= */}
{product.amenities && product.amenities.length > 0 && (
  <div className="product-amenities">
    <h4 className="amenities-title">Amenities</h4>
    <ul className="amenities-list">
      {product.amenities.map((amenity, index) => (
        <li key={index} className="amenity-item">
          ✔ {amenity}
        </li>
      ))}
    </ul>
  </div>
)}

            {/* Detailed Rent Structure & Selection */}
            {roomRentDetails.length > 0 ? (
                <div className="room-rent-details">
                    <h4 className="room-rent-title">Select Monthly Rent (Sharing Basis):</h4>
                    <div className="room-selection-container">
                        {roomRentDetails.map((detail, index) => (
                            <button
                                key={index}
                                className={`room-select-btn ${
                                    selectedRoom?.type === detail.type ? 'selected' : ''
                                }`}
                                onClick={() => setSelectedRoom(detail)}
                            >
                                <strong>{detail.type}</strong>: ₹{detail.rent}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="product-price">
                    Starting Rent: ₹{product.startingRent} / month
                </p>
            )}
            
            <p className="product-price">
                Selected Rent: 
                <span className="current-rent">
                    {selectedRoom 
                        ? `₹${selectedRoom.rent} / month (${selectedRoom.type})` 
                        : "Please select a room type"}
                </span>
            </p>

            <div className="product-rating">
              <Rating value={product.averageRating} disable={true} />
              <span className="productCardSpan">
                {product.reviewCount}{" "}
                {product.reviewCount === 1 ? "Review" : "Reviews"}
              </span>
            </div>

            <div className="stock-status">
              <span
                className={
                  product.availableBeds > 0 ? "in-stock" : "out-of-stock"
                }
              >
                {product.availableBeds > 0
                  ? `Beds Available (${product.availableBeds})`
                  : "No Beds Available"}
              </span>
            </div>

            {/* ✅ VIEW ON MAP BUTTON */}
            <button
              className="add-to-cart-btn"
              style={{ marginTop: "10px" }}
              onClick={openMap}
            >
              View on Map
            </button>

            {product.availableBeds > 0 && selectedRoom && (
              <>
                <div className="quantity-controls">
                  <span className="quantity-label">
                    Stay Duration (Months):
                  </span>
                  <button
                    className="quantity-button"
                    onClick={decreaseQty}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="quantity-value"
                  />
                  <button
                    className="quantity-button"
                    onClick={increaseQty}
                  >
                    +
                  </button>
                </div>

                <button
                  className="add-to-cart-btn"
                  disabled={cartLoading}
                  onClick={addToCart}
                >
                  {cartLoading ? "Adding..." : "Add to Booking"}
                </button>
              </>
            )}

            {/* ================= REVIEW FORM ================= */}
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h3>Write a Review</h3>
              <Rating
  value={userRating}
  disable={false}
  onRatingChange={setUserRating}
/>

              <textarea
                placeholder="Write your review here..."
                className="review-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <button
                className="submit-review-btn"
                disabled={reviewLoading}
              >
                {reviewLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <div className="reviews-container">
        <h3>Customer Reviews</h3>
        {product.reviews?.length > 0 ? (
          <div className="reviews-section">
            {product.reviews.map((review, index) => (
              <div className="review-item" key={index}>
                <Rating value={review.rating} disable={true} />
                <p className="review-comment">{review.comment}</p>
                <p className="review-name">By: {review.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>

      <Footer />
    </>
  );
}

export default ProductDetails;