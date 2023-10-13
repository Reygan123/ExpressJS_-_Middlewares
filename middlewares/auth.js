const jwt = require("jsonwebtoken");
const SECRET_KEY = "rakamin";
const { Users, Movies } = require("../models");

// Mengecek apakah user sudah login atau belom
const authentication = async (req, res, next) => {
  try {
    // Verify token dengan jwt
    if (!req.headers.authorization) {
      throw { name: "Unauthenticated" };
    }
    const token = req.headers.authorization.split(" ")[1];

    // decode token
    const decoded = jwt.verify(token, SECRET_KEY);

    const foundUser = await Users.findOne({
      where: {
        email: decoded.email,
      },
    });

    if (foundUser) {
      // Buat custom property di request

      req.loggedUser = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
      };

      // Masuk ke middleware selanjutnya
      next();
    } else {
      throw { name: "Unauthenticated" };
    }
  } catch (err) {
    next(err);
  }
};

// Pengecekan setelah login
const authorization = async (req, res, next) => {
  try {
    // Movies id
    const { id } = req.params;

    const foundMovie = await Movies.findOne({
      where: {
        id,
      },
    });

    if (foundMovie) {
      const loggedUser = req.loggedUser;
      if (foundMovie.user_id === loggedUser.id) {
        next();
      } else {
        throw { name: "Unauthorized" };
      }
    } else {
      throw { name: "ErrorNotFound" };
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authentication,
  authorization,
};
