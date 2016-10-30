(function(module) {
  "use strict";

  var User = module.parent.require('./user'),
    db = module.parent.require('./database'),
    meta = module.parent.require('./meta'),
    nconf = module.parent.require('nconf'),
    passport = module.parent.require('passport'),
    async = module.parent.require('async'),
    YiBanStrategy = require('passport-yiban').Strategy;

  // var authenticationController = module.parent.require('./controllers/authentication');  

  var constants = Object.freeze({
    'name': "易班",
    'admin': {
      'icon': 'fa-qq',
      'route': '/plugins/sso-yiban'
    }
  });

  var YiBan = {};

  YiBan.getStrategy = function(strategies, callback) {
    meta.settings.get('sso-yiban', function (err, settings) {
      if (!err && settings.id && settings.secret) {
        passport.use(new YiBanStrategy({
          clientID: settings.id,
          clientSecret: settings.secret,
          callbackURL: nconf.get('url') + '/auth/yiban/callback',
          // passReqToCallback: true
        }, function (token, tokenSecret, profile, done) {
          // console.log(tokenSecret,profile);
          YiBan.login(profile.id, profile.username, profile.school, profile.picture, function (err, user) {
            if (err) {
              return done(err);
            }
            done(null, user);
          });
        }));

        strategies.push({
          name: 'yiban',
          url: '/auth/yiban',
          callbackURL: '/auth/yiban/callback',
          icon: constants.admin.icon,
          scope: 'user:email'
        });
      }

      callback(null, strategies);
    });
  };

  YiBan.login = function(yibanID, username, school, avatar, callback) {
    var email = username + '@users.noreply.yiban.com';

    YiBan.getUidByYiBanID(yibanID, function(err, uid) {
      if (err) {
        return callback(err);
      }

      if (uid) {
        // Existing User
        callback(null, {
          uid: uid
        });
      } else {
        var userData = {
          yibanid:yibanID,
          picture:avatar,
          gravatarpicture:avatar,
          uploadedpicture:avatar,
        }

        // New User
        var success = function(uid) {
          User.setUserFields(uid,userData);
          db.setObjectField('yibanid:uid', yibanID, uid);
          callback(null, {
            uid: uid
          });
        };
        //console.log(yibanID,username,school,avatar);
        User.create({
          username: username,
          school:school,
          email:email,
          picture:avatar,
          uploadedpicture:avatar
        }, function(err, uid){
          if(err !== null){
            callback(err);
          }else{
            success(uid);
          }
        });

      }
    });
  };

  YiBan.getUidByYiBanID = function(yibanID, callback) {
    db.getObjectField('yibanid:uid', yibanID, function(err, uid) {
      if (err) {
        callback(err);
      } else {
        callback(null, uid);
      }
    });
  };

  YiBan.addMenuItem = function(custom_header, callback) {
    custom_header.authentication.push({
      "route": constants.admin.route,
      "icon": constants.admin.icon,
      "name": constants.name
    });

    callback(null, custom_header);
  };

  YiBan.init = function(params, callback) {
    function renderAdmin(req, res) {
      res.render('admin/plugins/sso-yiban', {});
    }

    params.router.get('/admin/plugins/sso-yiban', params.middleware.admin.buildHeader, renderAdmin);
    params.router.get('/api/admin/plugins/sso-yiban', renderAdmin);

    callback();
  };

  module.exports = YiBan;
}(module));