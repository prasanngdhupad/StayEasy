import React, { useEffect, useState } from "react";
import "../AdminStyles/UpdateProduct.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getProductDetails } from "../features/products/productSlice";
import {
  removeErrors,
  removeSuccess,
  updateProduct,
} from "../features/admin/adminSlice";
import { toast } from "react-toastify";

function UpdateProduct() {
  const { success, error, loading } = useSelector((state) => state.admin);
  const { product } = useSelector((state) => state.product);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { updateId } = useParams();

  /* ================= FORM STATES ================= */
  const [title, setTitle] = useState("");
  const [startingRent, setStartingRent] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [availableBeds, setAvailableBeds] = useState("");
  // --- Room Rent States ---
  const [singleSharingRent, setSingleSharingRent] = useState("");
  const [twinSharingRent, setTwinSharingRent] = useState("");
  const [tripleSharingRent, setTripleSharingRent] = useState("");
  const [fourSharingRent, setFourSharingRent] = useState("");
  // ----------------------------
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const propertyTypes = ["PG", "Hostel", "Room", "Flat"];

  /* ================= FETCH PROPERTY ================= */
  useEffect(() => {
    dispatch(getProductDetails(updateId));
  }, [dispatch, updateId]);

  /* ================= SET DATA ================= */
  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setStartingRent(product.startingRent || "");
      setDescription(product.description || "");
      setPropertyType(product.propertyType || "");
      setAvailableBeds(product.availableBeds || "");
      setOldImages(product.images || []);

      // --- Set Room Rent Data ---
      const roomTypes = product.roomTypes || {};
      setSingleSharingRent(roomTypes.single || "");
      setTwinSharingRent(roomTypes.twin || "");
      setTripleSharingRent(roomTypes.triple || "");
      setFourSharingRent(roomTypes.fourSharing || "");
      // ------------------------------
    }
  }, [product]);

  /* ================= IMAGE HANDLER ================= */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([]);
    setImagePreview([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview((old) => [...old, reader.result]);
          setImages((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* ================= SUBMIT ================= */
  const updateProductSubmit = (e) => {
  e.preventDefault();

  const payload = {
    title,
    startingRent,
    description,
    propertyType,
    availableBeds,
    roomTypes: {
      single: singleSharingRent,
      twin: twinSharingRent,
      triple: tripleSharingRent,
      fourSharing: fourSharingRent,
    },
  };

  // Only send images if new ones selected; otherwise backend keeps old ones
  if (images.length > 0) {
    payload.images = images; // already base64 strings from FileReader
  }

  dispatch(updateProduct({ id: updateId, formData: payload }));
};



  /* ================= SUCCESS / ERROR ================= */
  useEffect(() => {
    if (success) {
      toast.success("Property Updated Successfully", {
        position: "top-center",
        autoClose: 3000,
      });
      dispatch(removeSuccess());
      navigate("/admin/products");
    }

    if (error) {
      toast.error(error, {
        position: "top-center",
        autoClose: 3000,
      });
      dispatch(removeErrors());
    }
  }, [dispatch, success, error, navigate]);

  return (
    <>
      <NavBar />
      <PageTitle title="Update Property" />

      <div className="update-product-wrapper">
        <h1 className="update-product-title">Update Property</h1>

        <form
          className="update-product-form"
          encType="multipart/form-data"
          onSubmit={updateProductSubmit}
        >
          <label>Property Title</label>
          <input
            type="text"
            className="update-product-input"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Starting Rent (per month)</label>
          <input
            type="number"
            className="update-product-input"
            required
            value={startingRent}
            onChange={(e) => setStartingRent(e.target.value)}
          />
          
          {/* ================= ROOM RENT INPUTS ================= */}
          <div className="room-rent-group">
            <h3 className="room-rent-group-title">Sharing Rent Details (Optional)</h3>
            
            <label>Single Sharing Rent (₹)</label>
            <input
              type="number"
              className="update-product-input"
              value={singleSharingRent}
              onChange={(e) => setSingleSharingRent(e.target.value)}
            />

            <label>Twin Sharing Rent (₹)</label>
            <input
              type="number"
              className="update-product-input"
              value={twinSharingRent}
              onChange={(e) => setTwinSharingRent(e.target.value)}
            />

            <label>Triple Sharing Rent (₹)</label>
            <input
              type="number"
              className="update-product-input"
              value={tripleSharingRent}
              onChange={(e) => setTripleSharingRent(e.target.value)}
            />

            <label>Four Sharing Rent (₹)</label>
            <input
              type="number"
              className="update-product-input"
              value={fourSharingRent}
              onChange={(e) => setFourSharingRent(e.target.value)}
            />
          </div>
          {/* ================= END ROOM RENT INPUTS ================= */}

          <label>Description</label>
          <textarea
            className="update-product-textarea"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Property Type</label>
          <select
            className="update-product-select"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="">Select Type</option>
            {propertyTypes.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>

          <label>Available Beds</label>
          <input
            type="number"
            className="update-product-input"
            required
            value={availableBeds}
            onChange={(e) => setAvailableBeds(e.target.value)}
          />

          <label>Property Images</label>
          <div className="update-product-file-wrapper">
            <input
              type="file"
              accept="image/*"
              multiple
              className="update-product-file-input"
              onChange={handleImageChange}
            />
          </div>

          <div className="update-product-preview-wrapper">
            {imagePreview.map((img, index) => (
              <img
                src={img}
                key={index}
                alt="Preview"
                className="update-product-preview-image"
              />
            ))}
          </div>

          <div className="update-product-old-images-wrapper">
            {oldImages.map((img, index) => (
              <img
                src={img.url}
                key={index}
                alt="Old"
                className="update-product-old-image"
              />
            ))}
          </div>

          <button className="update-product-submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Property"}
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}

export default UpdateProduct;