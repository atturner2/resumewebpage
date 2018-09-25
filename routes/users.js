var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');


var User = require('../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {title: 'Contact'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.get('/resume', function(req, res, next) {
  res.render('resume', {title: 'Resume'})
  // Render PDF and send to browser
      function dispatchPDF() {
        console.log('supposed to be rendering');
        page.render('AlexTurnerResume.docx', function() {
          fs.createReadStream('AlexTurnerResume.docx').pipe(res);
          phantom.exit();
        });
      };
});

router.post('/login', passport.authenticate('local',{failureRedirect:'/users/login',failureFlash: 'Invalid username or password'}),
  function(req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
  });

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

//first we check the database for a user with that password
passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err,user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unkown user'});
    }
//now we compare that users password to the password entered
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

//profileimage is the name from the Jade file
router.post('/register',upload.single('profileimage') ,function(req, res, next) {
  //need multer for file uploads, wont work with bodyparser
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var profileimage = req.body.profileimage
  //here we handle the file upload for the user's profile image
  if(req.file){
    console.log('Uploading File....');
    var profileimage = req.file.filename;
  } else {
    console.log("no file was uploaded....");
    var profileimage = 'noimage.jpg';
  }
  //here we handle the form validation using checkBody function
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  //here we will make sure password2 matches password
  req.checkBody('password2','passwords do not match').equals(req.body.password);

  //Here we will check for errors
  var errors = req.validationErrors();

  if(errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    //here we are setting the User from the Models file, similar to a custom
    //class in an object oriented language
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });
    //Here we use the constructor-like function we created in the Models file
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });
    //here we flash a message on the Members page when the login is successful
    req.flash('success', 'you are now registered and can log in!');

    res.location('/');
    res.redirect('/');
  }
});

//contact route for nodemailer
router.post('/contact/send', function(req, res) {
	var transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'atturner2@gmail.com',
				pass: 'Teamgilboa'
			}
	});
	var mailOptions = {
		from: 'Alex Turner <atturner2@gmail.com>',
		to: 'atturner2@gmail.com',
		subject: 'Website Submission',
		text: 'You have a submission with the following details....Name: '+req.body.Name+'Email: '+req.body.email+ 'message: '+req.body.message,
		html: "<p>You have a submission with the following details....Name: </p><ul><li>Name: " + req.body.name + "</li><li>Email: "+req.body.email+"</li><li>Message: "+req.body.message+"</li></ul>"
	}

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
			res.redirect('/');
		} else {
			console.log('Message Sent: '+info.response);
			res.redirect('/');
		}
	});
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success','you are now logged out');
  res.redirect('/users/login');
});
module.exports = router;
