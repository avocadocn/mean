'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);
    app.get('/users/me', users.me);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('user', {
        failureRedirect: '/signin',
        failureFlash: true
    }), users.session);

    app.post('/signup/next', users.create);


    app.get('/user/invite', users.invite);
    app.post('/user/validate', users.validate);

};
