var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = '966697304322-4pf6o516qvs4mdoug0nn263jmelj5c5u.apps.googleusercontent.com';
var CLIENT_SECRET = 'WmfqGoeL4uPd80ogRsfHNvwy';
var REDIRECT_URL = 'http://localhost:3000/auth/google/callback';
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var plus = google.plus('v1');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://google:123456@ds023684.mlab.com:23684/googleoauth';

var mongoDB;
MongoClient.connect(url, function (err, db) {
    mongoDB = db;
    console.log('connected');
});


router.get('/auth/google', function (req, res) {
    var scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'

    ];
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

var previousData = {};
var tokensInfo;
router.get('/auth/google/callback', function (req, res) {
    oauth2Client.getToken(req.query.code, function (err, tokens) {

        tokensInfo = tokens;
        if (!err) {
            oauth2Client.setCredentials(tokens);
            plus.people.get({userId: 'me', auth: oauth2Client}, function (err, response) {
                tokens.user = response;
                console.log(response.emails[0].value);

                mongoDB.collection('tokens').updateOne(
                    {
                        "user.emails": {
                            $elemMatch: {
                                "value": response.emails[0].value
                            }
                        }
                    },
                    {$set: tokens},
                    {upsert: true}
                );



                /*              mongoDB.collection('tokens').insertOne(tokens, function (err, result) {
                 console.log(err);
                 console.log(result);
                 });*/


                res.send(response);
            });
        }
    });
});

router.get('/auth/refreshToken', function (req, resp) {
    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    oauth2Client.setCredentials(tokensInfo);
    oauth2Client.refreshAccessToken(function (err, tokens) {
        resp.send(tokens);
    });
});

module.exports = router;
