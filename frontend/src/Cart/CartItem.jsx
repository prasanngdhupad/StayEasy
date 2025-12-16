import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  addItemsToCart,
  removeErrors,
  removeItemFromCart,
  removeMessage,
} from "../features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

function CartItem({ item }) {
  const dispatch = useDispatch();
  const { loading, success, error, message } = useSelector(
    (state) => state.cart
  );

  const [quantity, setQuantity] = useState(item.quantity);

  /* ================= MONTH CONTROLS ================= */
  const decreaseQty = () => {
    if (quantity <= 1) {
      toast.error("Stay duration cannot be less than 1 month");
      return;
    }
    setQuantity((q) => q - 1);
  };

  const increaseQty = () => {
    setQuantity((q) => q + 1);
  };

  /* ================= UPDATE ================= */
  const handleUpdate = () => {
    if (loading || quantity === item.quantity) return;

    dispatch(
      addItemsToCart({
        id: item.product,
        name: item.name,     // ✅ ADDED
        image: item.image,   // ✅ ADDED
        quantity,
        price: item.price,
        roomType: item.roomType,
      })
    );
  };

  /* ================= REMOVE ================= */
  const handleRemove = () => {
    dispatch(removeItemFromCart(item.product));
    toast.success("Property removed from booking");
  };

  /* ================= FEEDBACK ================= */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success && message) {
      toast.success(message, { toastId: "cart-update" });
      dispatch(removeMessage());
    }
  }, [success, message, dispatch]);

  return (
    <div className="cart-item">
      {/* PROPERTY INFO */}
      <div className="item-info">
        <img
          src={item.image || "/placeholder.png"}
          alt={item.name}
          className="item-image"
        />

        <div className="item-details">
          <h3 className="item-name">{item.name}</h3>

          <p className="item-price">
            <strong>{item.roomType}</strong>
          </p>

          <p className="item-price">
            <strong>Monthly Rent :</strong> ₹{item.price}
          </p>

          <p className="item-price">
            <strong>Stay :</strong> {item.quantity} month(s)
          </p>
        </div>
      </div>

      {/* QUANTITY */}
      <div className="quantity-controls">
        <button
          className="quantity-button"
          onClick={decreaseQty}
          disabled={loading}
        >
          -
        </button>

        <input
          type="number"
          value={quantity}
          readOnly
          className="quantity-input"
        />

        <button
          className="quantity-button"
          onClick={increaseQty}
          disabled={loading}
        >
          +
        </button>
      </div>

      {/* TOTAL */}
      <div className="item-total">
        <span className="item-total-price">
          ₹{item.price * item.quantity}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="item-actions">
        <button
          className="update-item-btn"
          disabled={loading || quantity === item.quantity}
          onClick={handleUpdate}
        >
          Update
        </button>

        <button
          className="remove-item-btn"
          disabled={loading}
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem;
