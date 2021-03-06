'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var _member = new Schema({
    uid: String,
    nickname: String,
    photo: String
});


/**
 * 企业组件
 */
var CompanyGroup = new Schema({
    cid: String,
    gid: String,
    group_type: String,
    name: String,
    member: [_member],
    leader: [_member],
    logo: {
        type: String,
        default: '/img/group/logo/default.png'
    },
    entity_type: String,
    brief: String,
    score: Number,                //和增强组件里的score相同,避免多表查询,注意保持一致性!
    photo: Array,
    arena_id: String
});

mongoose.model('CompanyGroup', CompanyGroup);