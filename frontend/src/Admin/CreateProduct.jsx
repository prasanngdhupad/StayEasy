import React, { useEffect, useState } from "react";
import "../AdminStyles/CreateProduct.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  removeErrors,
  removeSuccess,
} from "../features/admin/adminSlice";
import { toast } from "react-toastify";

function CreateProduct() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.admin);

  /* ================= BASIC ================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [forWhom, setForWhom] = useState("");

  /* ================= PRICING ================= */
  const [startingRent, setStartingRent] = useState("");
  
  // 🎯 FIX 1: NEW STATE FOR ROOM TYPES
  const [singleRent, setSingleRent] = useState("");
  const [twinRent, setTwinRent] = useState("");
  const [tripleRent, setTripleRent] = useState("");
  const [fourSharingRent, setFourSharingRent] = useState("");

  const [totalRooms, setTotalRooms] = useState("");
  const [availableBeds, setAvailableBeds] = useState("");

  /* ================= LOCATION ================= */
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  /* ================= OWNER ================= */
  const [phoneNumber, setPhoneNumber] = useState("");

  /* ================= AMENITIES ================= */
  const [amenities, setAmenities] = useState("");

  /* ================= IMAGES ================= */
  const [images, setImages] = useState([]); // Base64 strings
  const [imagePreview, setImagePreview] = useState([]);

  /* ================= SUBMIT ================= */
  const submitHandler = (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    // 🎯 FIX 3: INCLUDE roomTypes object
    const productData = {
      title,
      description,
      propertyType,
      forWhom,
      // Convert to Number for schema validation
      startingRent: Number(startingRent), 
      
      // ✅ Must send the roomTypes object based on the schema
      roomTypes: {
        single: Number(singleRent),
        twin: Number(twinRent),
        triple: Number(tripleRent),
        fourSharing: Number(fourSharingRent),
      },
      
      totalRooms: Number(totalRooms),
      availableBeds: Number(availableBeds),
      locality,
      city,
      fullAddress,
      // Convert to Number for schema validation
      latitude: Number(latitude), 
      longitude: Number(longitude), 
      phoneNumber,
      // Parse amenities back into an array
      amenities: amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      // Send the array of Base64 strings directly
      images,
    };

    dispatch(createProduct(productData));
  };

  /* ================= IMAGE HANDLER ================= */
  const imageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages([]);
    setImagePreview([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview((old) => [...old, reader.result]);
          setImages((old) => [...old, reader.result]); // BASE64
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }

    if (success) {
      toast.success("Property created successfully");
      dispatch(removeSuccess());

      // Reset form
      setTitle("");
      setDescription("");
      setPropertyType("");
      setForWhom("");
      setStartingRent("");
      
      // ✅ Reset new room rent states
      setSingleRent("");
      setTwinRent("");
      setTripleRent("");
      setFourSharingRent("");
      
      setTotalRooms("");
      setAvailableBeds("");
      setLocality("");
      setCity("");
      setFullAddress("");
      setLatitude("");
      setLongitude("");
      setPhoneNumber("");
      setAmenities("");
      setImages([]);
      setImagePreview([]);
    }
  }, [dispatch, error, success]);

  return (
    <>
      <NavBar />
      <PageTitle title="Create Property" />

      <div className="create-product-container">
        <h1 className="form-title">Add PG / Hostel / Room</h1>

        <form className="product-form" onSubmit={submitHandler}>
          {/* BASIC INFO */}
          <input className="form-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <textarea className="form-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

          <select className="form-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} required>
            <option value="">Property Type</option>
            <option value="PG">PG</option>
            <option value="Hostel">Hostel</option>
            <option value="Room">Room</option>
            <option value="Flat">Flat</option>
          </select>

          <select className="form-select" value={forWhom} onChange={(e) => setForWhom(e.target.value)} required>
            <option value="">For Whom</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Both">Both</option>
          </select>
          
          {/* PRICING */}
          <h2 className="section-title">Rent Details (Monthly)</h2>
          <input className="form-input" type="number" placeholder="Starting Rent (Lowest Price)" value={startingRent} onChange={(e) => setStartingRent(e.target.value)} required />
          
          {/* 🎯 FIX 2: NEW INPUTS FOR ROOM TYPES */}
          <input className="form-input" type="number" placeholder="Rent: Single Sharing" value={singleRent} onChange={(e) => setSingleRent(e.target.value)} />
          <input className="form-input" type="number" placeholder="Rent: Twin Sharing" value={twinRent} onChange={(e) => setTwinRent(e.target.value)} />
          <input className="form-input" type="number" placeholder="Rent: Triple Sharing" value={tripleRent} onChange={(e) => setTripleRent(e.target.value)} />
          <input className="form-input" type="number" placeholder="Rent: Four Sharing" value={fourSharingRent} onChange={(e) => setFourSharingRent(e.target.value)} />
          
          {/* AVAILABILITY */}
          <h2 className="section-title">Availability</h2>
          <input className="form-input" type="number" placeholder="Total Rooms" value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} required />
          <input className="form-input" type="number" placeholder="Available Beds" value={availableBeds} onChange={(e) => setAvailableBeds(e.target.value)} required />

          {/* LOCATION */}
          <h2 className="section-title">Location</h2>
          <input className="form-input" placeholder="Locality" value={locality} onChange={(e) => setLocality(e.target.value)} required />
          <input className="form-input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <input className="form-input" placeholder="Full Address" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required />

          <input className="form-input" type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
          <input className="form-input" type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />

          {/* OWNER & AMENITIES */}
          <h2 className="section-title">Contact & Amenities</h2>
          <input className="form-input" placeholder="Owner Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

          <input className="form-input" placeholder="Amenities (comma separated: WiFi, Power Backup, etc.)" value={amenities} onChange={(e) => setAmenities(e.target.value)} />

          {/* IMAGES */}
          <h2 className="section-title">Property Images</h2>
          <input type="file" multiple className="form-input-file" onChange={imageChange} required />

          <div className="image-preview-container">
            {imagePreview.map((img, i) => (
              <img key={i} src={img} alt="preview" className="image-preview" />
            ))}
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Property"}
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}

export default CreateProduct;