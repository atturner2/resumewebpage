var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');
//variable to hold connection to database
var db = mongoose.connection;

//User Schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  profileimage: {
    type: String,
  }
});
//This ipart is so we can use this outside of this file
var User = module.exports = mongoose.model('User', UserSchema);

// here we ccreate the getUserById and we need to use the module export because
//we are using it outside the file
module.exports.getUserById = function(id, callback){
  //the origincal passport used findById right from the route but we wanted
  //all of the user functions in this file
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
  //User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    callback(null, isMatch);
  });
}

//here we use bcryptjs to hash the password for security
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash;
        newUser.save(callback);
      });
    });
}
