require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT;

//DB
mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('DB Connected'))
  .catch(err => console.log(err.message));

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('uploads'));
app.use(
  session({
    secret: 'secretkey',
    saveUninitialized: true,
    resave: false,
  })
);
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Template Engine
app.set('view engine', 'ejs');

// Routes
app.use('', require('./routes/routes'));

app.listen(PORT, () => {
  console.log(`Server is Listening on ${PORT}`);
});
