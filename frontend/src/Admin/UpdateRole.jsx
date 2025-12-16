import React, { useEffect, useState } from "react";
import "../AdminStyles/UpdateRole.css";
import PageTitle from "../components/PageTitle";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  getSingleUser, 
  removeErrors, 
  removeSuccess, 
  updateUserRole 
} from "../features/admin/adminSlice";
import { toast } from "react-toastify";

function UpdateRole() {
  const { userId } = useParams();
  const { user, success, loading, error } = useSelector(state => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: "",
    role: ""
  });

  useEffect(() => {
    if (userId) {
      dispatch(getSingleUser(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserRole({ userId, role: formData.role }));
  };

  useEffect(() => {
    if (success) {
      toast.success("User Updated Successfully", { 
        position: 'top-center', 
        autoClose: 3000 
      });
      dispatch(removeSuccess());
      navigate('/admin/users');
    }
    if (error) {
      toast.error(error, { 
        position: 'top-center', 
        autoClose: 3000 
      });
      dispatch(removeErrors());
    }
  }, [dispatch, error, success, navigate]);

  if (loading) {
    return (
      <>
        <NavBar />
        <PageTitle title="Update User Role" />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Loading user data...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <PageTitle title="Update User Role" />
      
      <div className="page-wrapper">
        <div className="update-user-role-container">
          <h1>Update User Role</h1>
          
          <form className="form-group" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                readOnly 
                value={formData.name}  
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                readOnly 
                value={formData.email}  
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                name="role" 
                id="role" 
                required 
                value={formData.role}  
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                <option value="tenant">Tenant</option>  {/* ✅ Matches backend */}
                <option value="owner">Owner</option>    {/* ✅ Matches backend */}
                <option value="admin">Admin</option>    {/* ✅ Matches backend */}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              Update Role
            </button>
          </form>
        </div>
      </div>
      
    </>
  );
}

export default UpdateRole;
