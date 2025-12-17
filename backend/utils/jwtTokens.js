export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      // Change: Force these for cross-domain (Vercel -> Render)
      secure: true, 
      sameSite: "None", 
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      user,
      token,
    });
};
