export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const cookieExpireDays = Number(process.env.EXPIRE_COOKIE || 7);

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,          // REQUIRED on Vercel (HTTPS)
      sameSite: "None",      // ⚠️ MUST be capital N
      expires: new Date(
        Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
      ),
    })
    .json({
      success: true,
      user,
      token,
    });
};
