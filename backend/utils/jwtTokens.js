export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/", // 🔥 important
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      user,
      token, // ✅ Send token to frontend
    });
};
