import React, { useState } from "react";
import "../CartStyles/Shipping.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CheckoutPath from "./CheckoutPath";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";
import { saveShippingInfo } from "../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

function Shipping() {
  const shippingInfo =
    useSelector((state) => state.cart?.shippingInfo) || {};
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState(shippingInfo.address || "");
  const [pinCode, setPinCode] = useState(shippingInfo.pinCode || "");
  const [phoneNumber, setPhoneNumber] = useState(
    shippingInfo.phoneNumber || ""
  );
  const [country, setCountry] = useState(shippingInfo.country || "");
  const [state, setState] = useState(shippingInfo.state || "");
  const [city, setCity] = useState(shippingInfo.city || "");

  const shippingInfoSubmit = (e) => {
    e.preventDefault();

    const trimmedPhone = phoneNumber.replace(/\s+/g, "");
    if (!/^\d{10}$/.test(trimmedPhone)) {
      toast.error("Invalid Phone number! It should be 10 digits", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    dispatch(
      saveShippingInfo({
        name: user?.name,
        email: user?.email,
        address,
        pinCode,
        phoneNumber: trimmedPhone,
        country,
        state,
        city,
      })
    );

    navigate("/order/confirm");
  };

  return (
    <>
      <PageTitle title="Tenant Details" />
      <NavBar />
      <CheckoutPath activePath={0} />

      <div className="shipping-form-container">
        <h1 className="shipping-form-header">Tenant Details</h1>

        <form
          className="shipping-form"
          onSubmit={shippingInfoSubmit}
        >
          <div className="shipping-section">
            <div className="shipping-form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="shipping-form-group">
              <label htmlFor="pinCode">Pincode</label>
              <input
                type="text"
                id="pinCode"
                placeholder="Enter your pincode"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                required
              />
            </div>

            <div className="shipping-form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="shipping-section">
            <div className="shipping-form-group">
              <label htmlFor="country">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setState("");
                  setCity("");
                }}
                required
              >
                <option value="">Select a Country</option>
                {Country.getAllCountries().map((item) => (
                  <option
                    value={item.isoCode}
                    key={item.isoCode}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {country && (
              <div className="shipping-form-group">
                <label htmlFor="state">State</label>
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setCity("");
                  }}
                  required
                >
                  <option value="">Select a State</option>
                  {State.getStatesOfCountry(country).map(
                    (item) => (
                      <option
                        value={item.isoCode}
                        key={item.isoCode}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {state && (
              <div className="shipping-form-group">
                <label htmlFor="city">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="">Select a City</option>
                  {City.getCitiesOfState(country, state).map(
                    (item) => (
                      <option
                        value={item.name}
                        key={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="shipping-submit-btn"
          >
            Continue
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}

export default Shipping;
