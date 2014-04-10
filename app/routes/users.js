'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.get('/users/signin', users.signin);
    app.get('/users/signout', users.signout);
    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('user', {
        failureRedirect: '/users/signin',
        failureFlash: true
    }), users.loginSuccess);


    // Active produce
    app.get('/users/invite', users.invite);
    app.post('/users/dealActive', users.dealActive);
    app.get('/users/setProfile', users.setProfile);
    app.post('/users/dealSetProfile', users.dealSetProfile);
    app.get('/users/selectGroup', users.selectGroup);
    app.post('/users/dealSelectGroup', users.dealSelectGroup);
    app.get('/users/finishRegister', users.finishRegister);

    app.get('/users/getAccount', users.getAccount);
    app.post('/users/saveAccount', users.saveAccount);

    app.get('/users/editInfo', users.editInfo);
    app.post('/users/dealEditInfo', users.dealEditInfo);

    app.post('/users/joinCampaign', users.joinCampaign);
    app.post('/users/quitCampaign', users.quitCampaign);

};
