import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const token = await req.cookies.access_token || await req.headers["authorization"]?.split(" ")[1];
    
    if (!token) res.status(401).json("Not authenticated.");

    jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) {
        res.status(401).json("Invalid session.");
      } else {
        req.user = user;
        next();
      }
    });

    // const decode = jwt.verify(token, process.env.JWT);
    // next();
  } catch (error) {
    console.log("Error: ", error.message);
  }
};
