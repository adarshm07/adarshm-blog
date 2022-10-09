import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    // check if user already there in db, then login.
    const user = await User.findOne({ username: req.body.username });
    if (user) res.json("username already used.");
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({
      ...req.body,
      password: hash,
    });
    await newUser.save();
    res.status(200).json("User account created");
  } catch (error) {
    next(error);
    res.status(404).json(error.message);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).json("username or password is missing.");
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json("Please register an account.");

    const isAuthenticated = await bcrypt.compare(password, user.password);
    if (!isAuthenticated)
      return res.status(401).json("username or password is incorrect.");

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT,
      { expiresIn: "2h" }
    );

    // const { password, isAdmin, ...rest } = user._doc;
    user.password = undefined;
    user._doc.token = token;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(user);
  } catch (error) {
    res.status(400).json("Error.");
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("access_token", "").status(200).json("Logged out");
  } catch (error) {}
};
