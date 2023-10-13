// Router
const express = require("express");
const router = express.Router();
const { Users, Movies } = require("../models");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
const SECRET_KEY = "rakamin";

const { authentication, authorization } = require("../middlewares/auth.js");

// Users

// ----> Feature Register user baru
router.post("/register", async (req, res, next) => {
  // Menerima input data email, username sama password
  const { email, username, password } = req.body;

  // Password kemudian di hash menggunakan bcrypt
  const hashPassword = bcrypt.hashSync(password, salt);

  const createdUser = await Users.create(
    {
      email,
      username,
      password: hashPassword,
    },
    { returning: true }
  );

  res.status(201).json(createdUser);
});

// ---> Feature Login user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user di database
    const foundUser = await Users.findOne({
      where: {
        email,
      },
    });

    if (foundUser) {
      // 2. Check password
      const comparePassword = bcrypt.compareSync(password, foundUser.password);

      if (comparePassword) {
        // Generate token menggunakan jsonwebtoken
        const accessToken = jwt.sign(
          {
            email: foundUser.email,
            username: foundUser.username,
          },
          SECRET_KEY
        );

        res.status(200).json({
          message: "Login Sucessfully",
          email: foundUser.email,
          username: foundUser.username,
          accessToken,
        });
      } else {
        throw { name: "InvalidCredentials" };
      }
    } else {
      throw { name: "InvalidCredentials" };
    }
  } catch (err) {
    // Masuk ke middleware selanjutnya
    next(err);
  }
});

// Pengecekan login atau belum
router.use(authentication);
// Movies

//Membuat movies baru
router.post("/movies", async (req, res, next) => {
  try {
    const { title, description, rating, release_year } = req.body;
    const { id } = req.loggedUser;

    const game = await Movies.create(
      {
        title,
        description,
        rating,
        release_year,
        user_id: id,
      },
      { returning: true }
    );

    res.status(201).json({
      message: "Game created successfully",
      data: game,
    });
  } catch (err) {
    next(err);
  }
});

// List All Movies
router.get("/movies", async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5; // Jumlah item per halaman
    const offset = (page - 1) * limit;

    const movies = await Movies.findAll({
      limit: limit,
      offset: offset,
    });

    res.json(movies);
  } catch (error) {
    // Handle error appropriately
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Movies Berdasarkan ID
router.get("/movies/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundMovie = await Movies.findOne({
      where: {
        id,
      },
    });

    if (foundMovie) {
      res.status(200).json(foundMovie);
    } else {
      throw { name: "ErrorNotFound" };
    }
  } catch (err) {
    next(err);
  }
});

// Update Movies Berdasarkan ID

// Tidak bisa update / delete movie milik orang lain
// harus ada authorization
router.put("/movies/:id", authorization, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, rating, release_year } = req.body;

    const foundMovie = await Movies.findOne({
      where: {
        id,
      },
    });

    if (foundMovie) {
      const updatedGame = await foundMovie.update(
        {
          title: title || foundMovie.title,
          description: description || foundMovie.description,
          rating: rating || foundMovie.rating,
          release_year: release_year || foundMovie.release_year,
        },
        { returning: true }
      );

      res.status(200).json({
        message: "Game updated successfully",
        data: updatedGame,
      });
    } else {
      throw { name: "ErrorNotFound" };
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/movies/:id", authorization, async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundMovie = await Movies.findOne({
      where: {
        id,
      },
    });

    if (foundMovie) {
      await foundMovie.destroy();

      res.status(200).json({
        message: "Game deleted successfully",
      });
    } else {
      throw { name: "ErrorNotFound" };
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
