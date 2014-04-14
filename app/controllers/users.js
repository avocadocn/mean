'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Company = mongoose.model('Company'),
  encrypt = require('../middlewares/encrypt'),
  mail = require('../services/mail'),
  CompanyGroup = mongoose.model('CompanyGroup'),
  GroupMessage = mongoose.model('GroupMessage'),
  Campaign = mongoose.model('Campaign'),
  config = require('../config/config');


/**
 * Show login form
 */
exports.signin = function(req, res) {
  res.render('users/signin', {
    title: 'Signin',
    message: req.flash('error')
  });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.loginSuccess = function(req, res) {
  req.session.username = req.body.username;
  req.session.cid = req.user.cid;
  req.session.uid = req.user.id;
  res.redirect('/users/home');

};



/**
 * 通过邀请链接进入激活流程
 */
exports.invite = function(req, res) {
  var key = req.query.key;
  var name = req.query.name;
  if(key == undefined || name == undefined) {
    res.render('users/message', {title: 'error', message: 'bad request'});
  } else {
    if (encrypt.encrypt(name, config.SECRET) === key) {
      req.session.key = key;
      req.session.name = name;
      res.render('users/invite', {
        title: 'validate'
      });
    }
  }
};

/**
 * 处理激活验证
 */
exports.dealActive = function(req, res) {
  var key = req.session.key;
  var name = req.session.name;

  User.findOne({username: req.body.host + '@' + req.body.domain}, function(err, user) {
    if(err) {
      console.log(err);
    } else if(user) {
      if(user.active === false) {
        res.render('users/message', {title: '激活失败', message: '该用户已注册，但还没有激活，请通过激活链接完成激活。'});
      } else {
        res.render('users/message', {title: '重复激活', message: '该用户已注册并激活。'});
      }
    } else {
      if(encrypt.encrypt(name, config.SECRET) === key) {
        Company.findOne({'username': name}).exec(function(err, company){
          if (company != null) {
            for(var i = 0; i < company.email.domain.length; i++) {
              if(req.body.domain === company.email.domain[i]) {
                var user = new User();
                user.email = req.body.host + '@' + req.body.domain;
                user.username = user.email;
                user.cid = company.id;
                user.id = company.id + Date.now().toString(32) + Math.random().toString(32);
                user.save(function(err) {
                  if (err) {
                    console.log(err);
                    res.render('users/message', {title: '存入数据库失败', message: '存入数据库失败'});
                  }
                });
                //系统再给员工发一封激活邮件
                mail.sendStaffActiveMail(user.email, user.id, company.id);
                res.render('users/message', {title: '验证邮件', message: '我们已经给您发送了验证邮件，请登录您的邮箱完成激活'});
                return;
              }
            }
            res.render('users/message', {title: '验证失败', message: '请使用您的企业邮箱'});
          } else {
            res.render('users/message', {title: '验证失败', message: '这是一个无效的邀请链接'});
          }
        });
      } else {
        res.render('users/message', {title: '验证失败', message: '这是一个无效的邀请链接'});
      }
    }

  });
};

/**
 * 通过激活链接进入，完善个人信息
 */
exports.setProfile = function(req, res) {
  var key = req.query.key;
  var uid = req.query.uid;
  User.findOne({id: uid}, function(err, user) {
    if(err) {
      console.log(err);
      res.render('users/message', {title: '数据库错误', message: '数据库错误'});
    } else if(user) {
      if(user.active === true) {
        res.render('users/message', {title: '重复激活', message: '您已完成注册和激活，可以使用您的企业邮箱登录了。'});
      } else {
        req.session.cid = req.query.cid;
        if(encrypt.encrypt(uid, config.SECRET) === key) {
          res.render('users/setProfile', {
            title: '设置个人信息',
            key: key,
            uid: uid
          });
        } else {
          res.render('users/message', {title: '验证失败', message: '这是一个无效的邀请链接'});
        }
      }
    } else {
      res.render('users/message', {title: '激活失败', message: '您还没有注册，请通过邀请链接注册后再激活'});
    }
  });
  
};

/**
 * 处理个人信息表单
 */
exports.dealSetProfile = function(req, res) {
  User.findOne(
    {id : req.query.uid}
  , function(err, user) {
    if(err) {
      console.log(err);
      res.render('users/message', {title: '数据库错误', message: '数据库错误'});
    }
    else {
      if(user) {
        if(user.active === false) {
          user.nickname = req.body.nickname;
          user.password = req.body.password;
          user.realName = req.body.realName;
          user.department = req.body.department;
          user.phone = req.body.phone;

          user.save(function(err) {
            if(err) {
              console.log(err);
              res.render('users/message', {title: '数据库错误', message: '数据库错误'});
            }
            req.session.username = user.username;
            res.redirect('/users/selectGroup');
          });
        } else {
          res.render('users/message', {title: '重复激活', message: '您已完成注册和激活，可以使用您的企业邮箱登录了。'});
        }
      } else {
        res.render('users/message', {title: '激活失败', message: '您还没有注册，请通过邀请链接注册后再激活'});
      }
    }
  });

};

/**
 * 选择组件页面
 */
exports.selectGroup = function(req, res) {
  User.findOne({username: req.session.username}, function(err, user) {
    if(err) {
      console.log(err);
      res.render('users/message', {title: '数据库错误', message: '数据库错误'});
    } else if(user) {
      if(user.active === true) {
        res.render('users/message', {title: '重复激活', message: '您已完成注册和激活，可以使用您的企业邮箱登录了。'});
      } else {
        res.render('users/selectGroup', {title: '选择你的兴趣小组', group_head: '个人'});
      }
    } else {
      res.render('users/message', {title: '激活失败', message: '您还没有注册，请通过邀请链接注册后再激活'});
    }
  });
}

/**
 * 处理选择组件表单
 */
exports.dealSelectGroup = function(req, res) {
  if(req.body.selected == undefined) {
    return res.redirect('/users/selectGroup');
  }
  User.findOne({'username': req.session.username}, function(err, user) {
    if(user) {
      if (err) {
        res.status(400).send('用户不存在!');
        return;
      } else if(user) {
        if(user.active === false) {
          user.gid = req.body.selected;
          user.active = true;
          user.save(function(err){
            if(err){
              console.log(err);
              res.render('users/message', {title: '数据库错误', message: '数据库错误'});
            }
            for( var i = 0; i < user.gid.length; i ++) {
              CompanyGroup.findOne({'cid':user.cid,'gid':user.gid[i]}, function(err, company) {
                company.member.push(user.id);
                company.save(function(err){
                  if(err){
                    console.log(err);
                  }
                });
              });
            }
          });
          res.redirect('/users/finishRegister');
        } else {
          res.render('users/message', {title: '重复激活', message: '您已完成注册和激活，可以使用您的企业邮箱登录了。'});
        }
      }
    } else {
      res.render('users/message', {
        tittle: '错误!',
        message: '请通过邀请链接激活后再选择兴趣小组'
      });
    }
  });
};

/**
 * 完成注册
 */
exports.finishRegister = function(req, res) {
  res.render('users/message', {title: '激活成功', message: '激活成功'});
};







exports.getGroupMessages = function(req, res) {
  GroupMessage.find({'poster.cid': req.user.cid}, function(err, group_messages) {
    if (err) {
      console.log(err);
    } else {
      return res.send(group_messages);
    }
  });
};

exports.getCampaigns = function(req, res) {
  Campaign.find({'campaign.member': {'$elemMatch': {uid: req.user.id}}}, function(err, campaigns){
    if (err) {
      console.log(err);
    } else {
      return res.send(campaigns)
    }
  });
};


exports.home = function(req, res) {
  return res.render('users/home', {gids: req.user.gid});
}

exports.editInfo = function(req, res) {
  User.findOne({
    id: req.user.id
  },
  function (err, user) {
    if(err) {
      console.log(err);
    } else if(user) {
      Company.findOne({
        id: user.cid
      },
      function(err, company) {
        if(err) {
          console.log(err);
        } else if(company) {
          return res.render('users/editInfo',
            {title: '编辑个人资料',
            user: user,
            company: company
          });
        }
      });
    }
  });
};


//员工参加活动
exports.joinCampaign = function (req, res) {
  var cid = req.session.cid;
  var gid = req.session.gid;
  var uid = req.session.uid;
  var campaign_id = req.body.campaign_id; //该活动的id
  Campaign.findOne({
    id : campaign_id
  },
  function (err, campaign) {
    if (campaign) {
    campaign.campaign.member.push({'cid':cid, 'gid':gid, 'uid':uid});
    campaign.save(function (err) {
      console.log(err);
    });
    } else {
      console.log('没有此活动!');
    }
  });
  res.send("ok");
};


//员工退出活动
exports.quitCampaign = function (req, res) {
  var cid = req.session.cid;
  var gid = req.session.gid;
  var uid = req.session.uid;
  var campaign_id = req.body.campaign_id; //该活动的id
  Campaign.findOne({
        id : campaign_id
    },
    function (err, campaign) {
      if (campaign) {

        //删除该员工信息
        for( var i = 0; i < campaign.campaign.member.length; i ++) {
          if (campaign.campaign.member[i].uid === uid) {
            campaign.campaign.member.splice(i,1);
            break;
          }
        }

        campaign.save(function (err) {
          console.log(err);
        });
      } else {
          console.log('没有此活动!');
      }
    });
  res.send("ok");
};


//获取账户信息
exports.getAccount = function (req, res) {
    User.findOneAndUpdate({
            id : req.session.uid
        },req.body.user,null, function(err, user) {
            if(err) {
                console.log(err);
                res.send({'result':0,'msg':'数据错误'});
            }
            else {
                if (user) {
                    res.send({'result':1,'msg':'用户查找成功','data': user});
                } else {
                    res.send({'result':0,'msg':'不存在该用户'});
                }
            }
        });
};

//保存用户信息
exports.saveAccount = function (req, res) {
    User.findOneAndUpdate({
            id : req.session.uid
        }, req.body.user,null,function(err, user) {
            if(err) {
                console.log(err);
                res.send({'result':0,'msg':'数据错误'});
            }
            else {
                if (user) {
                    res.send({'result':1,'msg':'修改成功'});
                } else {
                    res.send({'result':0,'msg':'不存在该用户'});
                }
            }
        });
};

