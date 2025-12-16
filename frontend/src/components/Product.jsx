import React, { useState } from "react";
import "../componentStyles/Product.css";
import { Link } from "react-router-dom";
import Rating from "./Rating";

function Product({ product }) {
  const [rating, setRating] = useState(0);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  return (
    <Link to={`/product/${product._id}`} className="product_id">
      <div className="product-card">
        <img
          src={product.images?.[0]?.url}
          alt={product.title}
          className="product-image-card"
        />

        <div className="product-details">
          <h3 className="product-title">{product.title}</h3>

          {/* ✅ LOCALITY + CITY */}
          <p className="product-location">
            {product.locality}, {product.city}
          </p>

          <p className="home-price">
            <strong>Rent :</strong> ₹{product.startingRent}/month
          </p>

          <div className="rating_container">
            <Rating
              value={product.averageRating}
              onRatingChange={handleRatingChange}
              disable={true}
            />
          </div>

          <span className="productCardSpan">
            ({product.reviewCount}{" "}
            {product.reviewCount === 1 ? "Review" : "Reviews"})
          </span>

          <button className="add-to-cart">View Details</button>
        </div>
      </div>
    </Link>
  );
}

export default Product;
