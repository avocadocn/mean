'use strict';

// group routes use group controller
var group = require('../controllers/group');

var express = require('express');
var config = require('../../config/config');
var photoBodyParser = express.bodyParser({
  uploadDir: config.root + '/temp_uploads/',
  limit: 1024 * 500 });


module.exports = function(app) {
  app.get('/group/getgroups',group.getGroups);

  app.get('/group/getCompanyGroups/:id', group.getCompanyGroups);
  app.get('/group/getCompanyGroups', group.getCompanyGroups);


  app.get('/group/home/:groupId', group.home);
  app.get('/group/home', group.home);

  app.get('/group/info/:groupId', group.info);
  app.get('/group/info', group.info);
  
  app.get('/group/renderInfo', group.renderInfo);

  app.post('/group/saveInfo', group.saveInfo);

  app.get('/group/getCampaigns', group.getGroupCampaign);
  app.get('/group/getGroupMessages', group.getGroupMessage);
  app.get('/group/getGroupMembers', group.getGroupMember);

  app.post('/group/campaignCancel', group.campaignCancel);

  app.get('/group/competition/:competitionId', group.getCompetition);
  app.post('/group/updateFormation/:competitionId', group.updateFormation);
  //小组发布活动
  app.post('/group/campaignSponsor', group.sponsor);
  app.param('groupId',group.group);
  app.param('competitionId',group.competition);
  //编辑活动
  app.post('/group/campaignEdit', group.campaignEdit);




  //约战、应战
  app.post('/group/provoke', group.provoke);
  app.post('/group/responseProvoke', group.responseProvoke);

  app.post('/group/resultConfirm/:competitionId', group.resultConfirm);

  app.post('/group/tempLogo', photoBodyParser, group.tempLogo);
  app.post('/group/saveLogo', group.saveLogo);

  app.get('/group/editLogo', group.editLogo);

  app.get('/groupLogo/:id/:width/:height', group.getLogo);

  app.get('/group/:gid/managePhotoAlbum', group.managePhotoAlbum);
  app.get('/group/:gid/photoAlbum/:photoAlbumId', group.groupPhotoAlbumDetail);

  app.get('/group/competition/:competitionId/photoAlbum/:photoAlbumId', group.competitionPhotoAlbumDetail);


};
