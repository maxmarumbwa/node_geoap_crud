const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const path = require('path');

// Image upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); // absolute path
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

// initialize upload variable
const upload = multer({ storage: storage }).single("image");

// Insert a user into database route
router.post("/add", (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: "File upload failed", type: "danger" });
        }

        try {
            console.log("Uploaded file:", req.file);

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: req.file ? req.file.filename : null,
            });

            await user.save(); // async/await style

            req.session.message = {
                type: "success",
                message: "User added successfully!"
            };

            res.redirect("/");

        } catch (err) {
            console.error("Database error:", err);
            res.status(500).json({ message: err.message, type: "danger" });
        }
    });
});

// Home route - get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "name email phone image");
    res.render("index", {  // 
      title: "Home Page",
      users: users,
      message: req.session.message || null
    });
    req.session.message = null;
  } catch (err) {
    res.status(500).send("Error fetching users: " + err.message);
  }
});


router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users' });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

// GET edit user form
router.get("/edit/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("edit_user", { title: "Edit User", user: user });
  } catch (err) {
    res.status(500).send("Error fetching user: " + err.message);
  }
});

// POST update user
router.post("/edit/:id", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "File upload failed", type: "danger" });
    }

    try {
      const updatedData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      };

      if (req.file) {
        updatedData.image = req.file.filename; // update image if new one uploaded
      }

      await User.findByIdAndUpdate(req.params.id, updatedData);

      req.session.message = {
        type: "success",
        message: "User updated successfully!"
      };

      res.redirect("/");
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: err.message, type: "danger" });
    }
  });
});

// Delete user route
router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);

    req.session.message = {
      type: "success",
      message: "User deleted successfully!"
    };

    res.redirect("/");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Error deleting user: " + err.message);
  }
});
 

module.exports = router;
