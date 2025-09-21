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

// Pages
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
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

module.exports = router;
