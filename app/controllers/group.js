'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    encrypt = require('../middlewares/encrypt'),
    Group = mongoose.model('Group'),
    CompanyGroup = mongoose.model('CompanyGroup');


exports.saveGroups = function(req,res) {
    res.send('save');
   /* var _length =req.body.group.length();
    for(var _i=0;_i<_length;_i++){

    }
    var group = new Group();
    group.name = req.body.name;
    company.info.city.province = req.body.province;
    company.info.city.city = req.body.city;
    company.info.address = req.body.address;
    company.info.linkman = req.body.linkman;
    company.info.lindline.areacode = req.body.areacode;
    company.info.lindline.number = req.body.number;
    company.info.lindline.extension = req.body.extension;
    company.info.phone = req.body.phone;
    company.email.host = req.body.host;
    company.email.domain[0] = req.body.domain;

    company.provider = 'company';
    company.save(function(err) {
        if (err) {
            console.log(err);
            //检查信息是否重复
            switch (err.code) {
                case 11000:
                    break;
                case 11001:
                    res.status(400).send('该公司已经存在!');
                    break;
                default:
                    break;
            }
            return res.render('company/company_signup', {
                company: company
            });
        }
        //发送邮件
        mail.sendCompanyActiveMail(company.email.host+'@'+company.email.domain[0],company.info.name);
        res.render('company/company_wait', {
            title: '等待验证',
            message: '您的申请信息已经提交,等验证通过后我们会向您发送一封激活邮件,请注意查收!'
        });
    });*/
};

exports.getGroups = function(req,res) {
  Group.find(null,function(err,group){
      if (err) {
          res.status(400).send([]);
          return;
      };
      var _length = group.length;
      var groups = [];

      for(var i = 0; i < _length; i++ ){
        groups.push({'id':group[i].gid,'type':group[i].group_type,'select':'0'});
      }
      res.send(groups);
  });
};


exports.getAccount =function(req,res) {

};

exports.getInfo =function(req,res) {

};

exports.Info =function(req,res) {
  console.log(req.companyGroup);
  console.log(req.session);
    if(req.session.cpname != null || req.session.username != null ) {
        res.render('group/group_info', {
            title: '小组信息管理',
            companyGroup: req.companyGroup,
            companyname: req.session.cpname
        });
    }
    else
        res.redirect('/users/signin');
};

exports.saveAccount =function(req,res) {

};

exports.saveInfo =function(req,res) {

};


//返回公司组件的所有数据,待前台调用
exports.getCompanyGroups = function(req, res) {

  var company_id = req.session.cid;
  var param_id = req.params.id;
  if(param_id) {
    company_id = param_id;
  }
  CompanyGroup.find({cid: company_id}, function(err, company_groups) {
    if (err) {
      return res.status(404).send([]);
    } else {
      return res.send(company_groups);
    }
  });

};

exports.group = function(req, res, next, id) {
  CompanyGroup
    .findOne({
        cid: req.session.cid,
        gid: id
    })
    .exec(function(err, companyGroup) {
        if (err) return next(err);
        if (!companyGroup) return next(new Error('Failed to load companyGroup ' + id));
        req.companyGroup = companyGroup;
        next();
    });
}

