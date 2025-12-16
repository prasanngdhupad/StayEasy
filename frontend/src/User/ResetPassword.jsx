import React, { useEffect, useState } from "react";
import "../UserStyles/Form.css";
import PageTitle from "../components/PageTitle";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeSuccess, resetPassword } from "../features/user/userSlice";
import { toast } from "react-toastify";
import { removeErrors } from "../features/user/userSlice";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const { success, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resetPasswordSubmit = (e) => {
    e.preventDefault();
    const data = {
      password,
      confirmPassword,
    };
    dispatch(resetPassword({ token, userData: data }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);
  useEffect(() => {
    if (success) {
      toast.success("Password Reset Successfully", {
        position: "top-center",
        autoClose: 3000,
      });
      dispatch(removeSuccess());
      navigate("/login");
    }
  }, [dispatch, success]);
  return (
    <>
      <PageTitle title="Reset Password" />
      <div className="container update-container">
        <div className="form-content">
          <form className="form" onSubmit={resetPasswordSubmit}>
            <h2>Reset Password</h2>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Enter your new Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="confirmpassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button className="authBtn">Reset Password</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
