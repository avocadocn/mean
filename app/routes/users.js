'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.get('/users/signin', users.signin);
    app.get('/users/signup', users.signup);
    app.get('/users/signout', users.signout);
    app.get('/users/me', users.me);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('user', {
        failureRedirect: '/users/signin',
        failureFlash: true
    }), users.loginSuccess);

    app.post('/users/updateProfile', users.updateProfile);


    app.get('/users/invite', users.invite);
    app.post('/users/validate', users.validate);

    app.get('/users/signup/groupList', users.groupList);
    app.post('/users/signup/groupSelect', users.groupSelect);
    app.get('/users/signup/finished', users.signupFinished);

    app.get('/users/edit/info', users.infoEditForm);
    app.post('/users/edit', users.edit);

};
