export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,          // HTTPS only (required for SameSite=none)
      sameSite: "none",      // 🔥 LOWERCASE (CRITICAL)
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      user,
      token,
    });
};
