const authorize = (permittedRoles) => {
    return (req, res, next) => {
        // console.log(req.user,"user");
        console.log(req.user.user.role);
      if (permittedRoles.includes(req.user.user.role)) next();
      else res.status(401).json({ message: "Unauthorized" });
    };
  };
  
  module.exports = { authorize };