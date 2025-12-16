import React, { useEffect, useCallback } from "react";
import "../AdminStyles/UsersList.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { Link, useNavigate } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessage,
  deleteUser,
  fetchUsers,
  removeErrors,
} from "../features/admin/adminSlice";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

function UserList() {
  const { users, loading, error, message } = useSelector((state) => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = useCallback((userId) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (confirm) {
      dispatch(deleteUser(userId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }

    if (message) {
      toast.success(message, { position: "top-center", autoClose: 3000 });
      dispatch(clearMessage());
      dispatch(fetchUsers()); // Refresh list
    }
  }, [dispatch, error, message]);

  if (loading) {
    return (
      <>
        <NavBar />
        <Loader />
        <Footer />
      </>
    );
  }

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'tenant': return 'Tenant';
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  return (
    <>
      <NavBar />
      <PageTitle title="All Users" />
      
      <div className="usersList-container">
        <div className="usersList-table-container">
          <table className="usersList-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link
                        to={`/admin/user/${user._id}`}
                        className="action-icon edit-icon"
                        title="Edit User"
                      >
                        ✏️
                      </Link>
                      <button
                        className="action-icon delete-icon"
                        onClick={() => handleDelete(user._id)}
                        title="Delete User"
                      >
                        <Delete />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </>
  );
}

export default UserList;
