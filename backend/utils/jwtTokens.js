export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,          // required for HTTPS (Vercel/Render)
      sameSite: "none",      // cross-site cookie
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      user, // ✅ DO NOT SEND TOKEN TO FRONTEND
    });
};
