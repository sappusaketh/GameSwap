var mongoose = require('mongoose');
/*DB connection DB name: mydb */
// var db= mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true })

var Schema = mongoose.Schema;

var userCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 4 },
  },
  { versionKey: false, collection: 'counter' }
);

var userSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    UserId: { type: Number, required: true, unique: true },
    Username: { type: String, unique: true, required: true },

    hash: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    EmailAddress: { type: String, unique: true, required: true },
    Address1: { type: String, default: 'null' },
    Address2: { type: String, default: 'null' },
    City: { type: String, default: 'null' },
    State: { type: String, default: 'null' },
    PostCode: { type: Number, default: 00000 },
    Country: { type: String, default: 'null' },
  },
  {
    versionKey: false,
    collection: 'users',
  }
);

/**get allusers method returns all the users in the db */

userSchema.statics.getallusers = function (UserId, cb) {
  if (!UserId) {
    return this.find({}, cb);
  } else {
    return this.find({ UserId: UserId }, cb);
  }
};
/**below method returns the users with specific user id */
userSchema.statics.getuserbyuserid = function (UserId, cb) {
  if (UserId) {
    return this.find({ UserId: UserId }, cb);
  } else {
    return this.find({}, cb);
  }
};

var usercounter = mongoose.model('usercounter', userCounterSchema);
var user = mongoose.model('user', userSchema);

/**add user method to add new user to collection
 * used during registration
 * returns the data added to the collection
 */
var addUser = function (
  Username,
  hash,
  salt,
  firstName,
  lastName,
  EmailAddress,
  Address1,
  City,
  State,
  PostCode,
  Country
) {
  var user = {
    Username: Username,
    hash: hash,
    salt: salt,
    //password:password,
    firstName: firstName,
    lastName: lastName,
    EmailAddress: EmailAddress,
    Address1: Address1,
    // Address2:Address2,
    City: City,
    State: State,
    PostCode: PostCode,
    Country: Country,
  };

  return user;
};

var AddUser = function (NewUser) {
  return new Promise(function (resolve, reject) {
    usercounter
      .findByIdAndUpdate(
        { _id: 'UserCounter' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      )
      .then(function (count) {
        NewUser.UserId = count.seq;
        var newuser = new user(NewUser);

        newuser.save(function (err, res) {
          if (err) {
            usercounter
              .findByIdAndUpdate(
                { _id: 'UserCounter' },
                { $inc: { seq: -1 } },
                { new: true, upsert: true }
              )
              .then(function (count) {})
              .catch(function (error) {
                console.error('counter error-> : ' + error);
                throw error;
              });
            console.log('error from add user: ' + err);
          } else {
            resolve(res);
            console.log(
              'newuser with userID: ' +
                res.UserId +
                ' and username: ' +
                NewUser.Username +
                ' is saved'
            );
          }
        });
      })
      .catch(function (error) {
        console.error('counter error-> : ' + error);
        throw error;
      });
  });
};
var getallusers = function () {
  return user.find({});
};

module.exports.addUser = addUser;
module.exports.AddUser = AddUser;
module.exports.user = user;
