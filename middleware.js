const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    res.status(403).json({
      message: "Token not given",
    });
  }

  const decoded = jwt.verify(token, "ashishiscool123");

  const username = decoded.username;

  if (username) {
    req.username = username;
    next();
  } else {
    res.status(403).json({
      message: "Auth token incorrect",
    });
  }
}

module.exports = {
  authMiddleware: authMiddleware,
};
