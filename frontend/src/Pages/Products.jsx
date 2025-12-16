import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../pageStyles/Products.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import Product from "../components/Product";
import { getProduct, removeErrors } from "../features/products/productSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";

function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, products, totalPages } = useSelector((state) => state.product);

  // ================= STABLE URL PARAMS =================
  const urlParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get("page")) || 1;
    const keyword = params.get("keyword") || "";
    const sort = params.get("sort") || "";
    const minPriceUrl = parseFloat(params.get("minPrice"));
    const maxPriceUrl = parseFloat(params.get("maxPrice"));
    
    return {
      page,
      keyword,
      sort,
      minPrice: isNaN(minPriceUrl) ? "" : minPriceUrl,
      maxPrice: isNaN(maxPriceUrl) ? "" : maxPriceUrl,
    };
  }, [location.search]);

  // ================= UI INPUT STATES =================
  const [keywordInput, setKeywordInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [sortInput, setSortInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ================= 1. URL SYNC EFFECT (FIXED) =================
  useEffect(() => {
    // Sync UI with URL
    setKeywordInput(urlParams.keyword);
    setMinPriceInput(urlParams.minPrice === "" ? "" : String(urlParams.minPrice));
    setMaxPriceInput(urlParams.maxPrice === "" ? "" : String(urlParams.maxPrice));
    setSortInput(urlParams.sort);
    setCurrentPage(urlParams.page);

    // Fetch data with stable params
    dispatch(getProduct(urlParams));
  }, [urlParams, dispatch]); // Stable dependency - no infinite loop!

  // ================= 2. PAGE CHANGE =================
  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(location.search);
    params.set("page", newPage.toString());
    navigate({ search: params.toString() }, { replace: true });
  }, [location.search, navigate]);

  // ================= 3. FILTER SUBMIT =================
  const handleFilterSubmit = useCallback(() => {
    const params = new URLSearchParams();

    // Add valid parameters only
    if (keywordInput.trim()) params.set("keyword", keywordInput.trim());
    if (sortInput) params.set("sort", sortInput);

    const min = parseFloat(minPriceInput);
    const max = parseFloat(maxPriceInput);
    
    if (!isNaN(min) && min >= 0) params.set("minPrice", min.toString());
    if (!isNaN(max) && max >= 0) params.set("maxPrice", max.toString());

    // Reset to page 1
    params.set("page", "1");

    navigate({ search: params.toString() });
  }, [keywordInput, minPriceInput, maxPriceInput, sortInput, navigate]);

  // ================= 4. CLEAR FILTERS =================
  const handleClearFilters = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  // ================= ERROR HANDLING =================
  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center" });
      dispatch(removeErrors());
    }
  }, [error, dispatch]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <PageTitle title="All Properties" />
          <NavBar />

          <div className="products-layout">
            {/* ================= FILTER SECTION ================= */}
            <div className="filter-section">
              <h3 className="filter-heading">Search & Filter</h3>
              
              <input
                type="text"
                placeholder="City / Locality"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="filter-input"
              />

              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Min Budget"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="filter-input"
              />

              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Max Budget"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="filter-input"
              />

              <select
                className="filter-input"
                value={sortInput}
                onChange={(e) => setSortInput(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <div className="filter-buttons">
                <button className="filter-btn" onClick={handleFilterSubmit}>
                  Search
                </button>
                <button 
                  onClick={handleClearFilters}
                  disabled={!location.search}
                  className="filter-btn"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* ================= PRODUCTS SECTION ================= */}
            <div className="products-section">
              {products && products.length > 0 ? (
                <div className="products-product-container">
                  {products.map((product) => (
                    <Product key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                  {location.search
                    ? "No properties found matching your criteria"
                    : "No properties available"
                  }
                </p>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>

          <Footer />
        </>
      )}
    </>
  );
}

export default Products;
