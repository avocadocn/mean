'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Company = mongoose.model('Company');

var mail = require('../services/mail');
/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};



/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('company/company_signup', {
        title: '注册',
        company: new Company()
    });
};

exports.wait = function(req, res) {
    res.render('company/company_wait', {
        title: '等待验证'
    });
};

exports.validate_error = function(req, res) {
    res.render('company/company_validate_error', {
        title: '验证错误'
    });
};

exports.validate_next = function(req, res) {
    res.render('company/company_validate_next', {
        title: '验证成功,可以进行下一步!'
    });
};
/**
 * 创建公司基本信息
 */
exports.create = function(req, res, next) {
    var company = new Company(req.body);
    var message = null;

    company.info.name = req.body.name;
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

    company.provider = 'local';
    company.save(function(err) {
        if (err) {
            //检查信息是否重复
            
            return res.render('company/company_signup', {
                message: message,
                company: company
            });
        }
        //发送邮件
        mail.sendActiveMail(company.email.host+'@'+company.email.domain[0],company.info.name);
        res.render('company/company_wait', {
            title: '等待验证',
            message: '您的申请信息已经提交,等验证通过后我们会向您发送一封激活邮件,请注意查收!'
        });
    });
};


/**
 * 验证通过后创建公司进一步的信息(用户名\密码等)
 */


/**
 * Send Company
 */
exports.me = function(req, res) {
    res.jsonp(req.company || null);
};

/**
 * Find company by id
 */
exports.company = function(req, res, next, id) {
    Company
        .findOne({
            _id: id
        })
        .exec(function(err, company) {
            if (err) return next(err);
            if (!company) return next(new Error('Failed to load Company ' + id));
            req.profile = company;
            next();
        });
};
