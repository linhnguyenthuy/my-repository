const User = require("../models/Sign_up");

const isAuthenticated = async (req, res, next) => {
  //   console.log(req.headers.authorization);
  const token = req.headers.authorization.replace("Bearer ", "");
  //   console.log(token);
  const useDB = await User.findOne({ token });
  //   console.log(useDB);
  if (useDB) {
    req.user = useDB;
    return next();
  } else {
    return res.status(401).json({ error: "you need to login" });
  }
};
module.exports = isAuthenticated;
