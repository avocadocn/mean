'use strict';

var tabViewUser = angular.module('tabViewUser', ['ngRoute','ngAnimate','mgcrea.ngStrap.datepicker']);

tabViewUser.directive('match', function($parse) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(function() {
        return $parse(attrs.match)(scope) === ctrl.$modelValue;
      }, function(currentValue) {
        ctrl.$setValidity('mismatch', currentValue);
      });
    }
  };
});

tabViewUser.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/group_message', {
        templateUrl: '/views/group_message_list.html',
        controller: 'GroupMessageController',
        controllerAs: 'messages'
      })
      .when('/schedule', {
        templateUrl: '/views/campaign_list.html',
        controller: 'CampaignListController',
        controllerAs: 'campaign'
      })
      .when('/personal', {
        templateUrl: '/users/editInfo',
        controller: 'AccountFormController',
        controllerAs: 'account'
      })
      .when('/changePassword', {
        templateUrl: '/views/change_password.html',
        controller: 'PasswordFormController',
        controllerAs: 'password'
      }).
      otherwise({
        redirectTo: '/group_message'
      });
  }]);

tabViewUser.controller('GroupMessageController', ['$http','$scope',
  function ($http, $scope) {
    $http.get('/users/getGroupMessages').success(function(data, status) {
      $scope.group_messages = data;
      $scope.show = false;
      $scope.voteFlag = true;
    });

    $scope.vote = function(provoke_message_id, status, index) {
         try {
            $http({
                method: 'post',
                url: '/users/vote',
                data:{
                    provoke_message_id : provoke_message_id,
                    aOr : status
                }
            }).success(function(data, status) {
                if(data.msg != undefined && data.msg != null) {
                    alert(data.msg);
                } else {
                    $scope.group_messages[index].positive = data.positive;
                    $scope.group_messages[index].negative = data.negative;
                }
            }).error(function(data, status) {
                alert('数据发生错误！');
            });
        }
        catch(e) {
            console.log(e);
        }
    };
}]);

tabViewUser.controller('CampaignListController', ['$http','$scope',
  function ($http, $scope) {
    $http.get('/users/getCampaigns').success(function(data, status) {
      $scope.campaigns = data.data;
      $scope.show = false;
    });


    $scope.join = function(campaign_id) {
        try {
            $http({
                method: 'post',
                url: '/users/joinCampaign',
                data:{
                    campaign_id : campaign_id
                }
            }).success(function(data, status) {
                window.location.reload();
                //TODO:更改对话框
                alert('成功加入该活动!');
            }).error(function(data, status) {
                alert('数据发生错误！');
            });
        }
        catch(e) {
            console.log(e);
        }
    };

    $scope.quit = function(campaign_id) {
        try {
            $http({
                method: 'post',
                url: '/users/quitCampaign',
                data:{
                    campaign_id : campaign_id
                }
            }).success(function(data, status) {
                window.location.reload();
                alert('您已退出该活动!');
            }).error(function(data, status) {
                alert('数据发生错误！');
            });
        }
        catch(e) {
            console.log(e);
        }
    };
}]);

tabViewUser.controller('AccountFormController',['$scope','$http',function($scope, $http) {
    $http.get('/users/getAccount').success(function(data,status){
        if(data.result === 1){
            $scope.user = data.data;
        }
        else{
             console.log(data.msg);
        }
    }).error(function(data,status) {
        //TODO:更改对话框
        console.log('个人账号信息获取失败！');
    });
    $scope.baseUnEdit = true;
    $scope.baseButtonStatus = '编辑';
    $scope.linkUnEdit = true;
    $scope.linkButtonStatus = '编辑';
    $scope.baseEditToggle = function() {
        $scope.baseUnEdit = !$scope.baseUnEdit;
        if($scope.baseUnEdit) {
            try{
                var _info ={
                    email: $scope.user.email,
                    nickname: $scope.user.nickname,
                    realname: $scope.user.realname,
                    position: $scope.user.position,
                    sex: $scope.user.sex,
                    birthday: $scope.user.birthday,
                    bloodType: $scope.user.bloodType,
                    introduce: $scope.user.introduce,
                };
                $http({
                    method : 'post',
                    url : '/users/saveAccount',
                    data : {
                        user : _info
                    }
                }).success(function(data, status) {
                    //TODO:更改对话框
                    if(data.result === 1)
                        alert('信息修改成功！');
                    else
                        alert(data.msg);
                }).error(function(data, status) {
                    //TODO:更改对话框
                    alert('数据发生错误！');
                });
            }
            catch(e) {
                console.log(e);
            }
            $scope.baseButtonStatus = '编辑';
        }
        else {
            $scope.baseButtonStatus = '保存';
        }
    };
    $scope.linkEditToggle = function() {
        $scope.linkUnEdit = !$scope.linkUnEdit;
        if($scope.linkUnEdit) {
            try{
                var _info ={
                    phone: $scope.user.phone,
                    email: $scope.user.email,
                    qq: $scope.user.qq
                };
                $http({
                    method : 'post',
                    url : '/users/saveAccount',
                    data : {
                        user : _info
                    }
                }).success(function(data, status) {
                    console.log(data);
                    //TODO:更改对话框
                    if(data.result === 1)
                        alert('信息修改成功！');
                    else
                        alert(data.msg);
                }).error(function(data, status) {
                    //TODO:更改对话框
                    alert('数据发生错误！');
                });
            }
            catch(e) {
                console.log(e);
            }
            $scope.linkButtonStatus = '编辑';
        }
        else {
            $scope.linkButtonStatus = '保存';
        }
    };

}]);

tabViewUser.controller('PasswordFormController', ['$http','$scope', function($http, $scope) {
    $scope.nowpassword = '';
    $scope.newpassword = '';
    $scope.confirmpassword = '';
    this.change_password = function(){
        $http({
            method : 'post',
            url : '/users/changePassword',
            data : {
                'nowpassword' : $scope.nowpassword,
                'newpassword' : $scope.newpassword
            }
        }).success(function(data, status) {
            //TODO:更改对话框
            if(data.result === 1){
                alert(data.msg);
                window.loaction.href = '#/personal';
            }
            else
                alert(data.msg);
        }).error(function(data, status) {
            //TODO:更改对话框
            alert('数据发生错误！');
        });
    };
}]);