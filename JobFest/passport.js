var localStrategy = require('passport-local').Strategy;
const passport= require('passport');
const user = require('./schema/authSchema');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        user.findOne({ email: email }, (err, data) => {
            if (err) throw err;
            if (!data) {
                return done(null, false, { message: "User doesn't exists.", type: "warning" });
            }
            bcrypt.compare(password, data.password, (err, match) => {
                if (err) {
                    return done(null, false);
                }
                if (!match) {
                    return done(null, false, { message: "Password doesn't match.", type: "danger"});
                }
                if (match) {
                    return done(null, data);
                }
            });
        });
    }));
}    
passport.serializeUser(function (user, cb) {
        cb(null, user.id);
    });

    
passport.deserializeUser(function (id, cb) {
        user.findById(id, function (err, user) {
            cb(err, user);
        });
    });

// ---------------
// end of autentication statregy