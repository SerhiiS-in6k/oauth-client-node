var express = require('express');
var router = express.Router();

var request = require('request');

var ClientOAuth2 = require('client-oauth2');

var githubAuth = new ClientOAuth2({
  clientId: '966697304322-4pf6o516qvs4mdoug0nn263jmelj5c5u.apps.googleusercontent.com',
  clientSecret: 'WmfqGoeL4uPd80ogRsfHNvwy',
  accessTokenUri: 'https://accounts.google.com/o/oauth2/token',
  authorizationUri: 'https://accounts.google.com/o/oauth2/auth',
  authorizationGrants: ['credentials'],
  redirectUri: 'http://localhost:3000/auth/google/callback',
  scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/auth/google', function (req, res) {
  var uri = githubAuth.code.getUri();
  res.redirect(uri)
});

router.get('/auth/google/callback', function (req, res) {
  githubAuth.code.getToken(req.url)
      .then(function (user) {
        console.log(user);
        user.refresh()
            .then(
                function (updatedUser) {
                  console.log('\n\n\nUPDATE USER\n\n\n');
                  console.log(updatedUser === user) //=> true
                });
        request({ 
          url: 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + user.accessToken,
          method: "GET"
        }, function (err, response, data) {
          res.send(data);
        });
      })
});

module.exports = router;
