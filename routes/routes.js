const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const upload = multer({ storage }).single('image');

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      res.render('index', { title: 'Home', users });
    }
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: err.message });
  }
});

// ADD USER VIEW
router.get('/add', (req, res) => {
  res.render('add_user', { title: 'Add User' });
});

// ADD USER API
router.post('/add', upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user.save(err => {
    if (err) {
      return res.status(400).json({ status: 'fail', error: err.message });
    } else {
      req.session.message = {
        status: 'success',
        message: 'user add successfuly',
      };
      res.redirect('/');
    }
  });
});

// EDIT USER VIEW
router.get('/edit/:_id', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (user) {
      res.render('edit_user', { title: 'Edit User', user });
    } else {
      res.redirect('/');
    }
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message });
  }

  res.render('edit_user', { title: 'Edit User' });
});

// EDIT USER API
router.post('/update/:_id', upload, async (req, res) => {
  try {
    const id = req.params._id;
    let new_image = '';
    if (req.file) {
      new_image = req.file.filename;
      fs.unlink('./uploads/' + req.body.old_image, err => {
        if (err) {
          console.log(err.message);
          new_image = req.body.old_image;
          return res.status(400).json({ status: 'fail', error: err.message });
        }
      });
    } else {
      new_image = req.body.old_image;
    }
    const result = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });
    if (result) {
      req.session.message = {
        status: 'success',
        message: 'User Updated Succesfully',
      };
      res.redirect('/');
    }
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message });
  }
});

router.get('/delete/:_id', async (req, res) => {
  try {
    const id = req.params._id;
    const result = await User.findOneAndDelete({ _id: id });
    if (result) {
      fs.unlink('./uploads/' + result.image, err => {
        if (err) {
          console.log(err.message);
          return res.status(400).json({ status: 'fail', error: err.message });
        }
      });
      req.session.message = {
        status: 'info',
        message: 'User Deletdd Succesfully',
      };
      res.redirect('/');
    }
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message });
  }
});

module.exports = router;
