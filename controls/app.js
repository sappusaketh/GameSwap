var express = require('express');
var itemdb = require('../models/itemDB');
var itemFeedback = require('../models/FeedbackDB').itemFeedback;
var userFeedback = require('../models/FeedbackDB').userFeedback;
var specificuserrating = require('../models/FeedbackDB').specificuserrating;
var item = itemdb.item;
var helmet = require('helmet')
var offer = require('../models/OfferDB').offer;
var app = express();
app.use(helmet())
var { check, validationResult } = require('express-validator/check');

var session = require('express-session')
app.use(session({ secret: "thisissecret", resave: false, saveUninitialized: true }));

app.use('/resources', express.static('../resources'));

app.set('view engine', 'ejs');

app.set('views', '../views');

app.use(require('./ProfileController'))

app.get('/index', function (req, res) {
    if (req.session.theUser == undefined) {
        res.render('index',{width:'100px'})
    }
    else {
        /*session variable is sent when user logs in successfull */
        res.render('index', { session: [1], Userfname: req.session.theUser.firstName })
    }
});

/*item route*/
app.get('/items?:itemurl', check('itemcode', 'invalid itemcode').isAlphanumeric().trim(), function (req, res) {
    var errors = validationResult(req)
    if (!errors.isEmpty()) { //checks for errors if errors no item inforation will be shown and sent to ejs pages
        var errorsarray = errors.array();

        if (req.session.theUser == undefined) {//when user is not logged in
            var session = undefined;
            var Userfname = undefined;
        }
        else {//when user is logged in
            var session = [1];
            var Userfname = req.session.theUser.firstName;
        }
        res.render('items', { errors: errorsarray, session: session, Userfname: Userfname })
    }
    else { //executes when there are no errors
        var item_code = req.query.itemcode; //itemcode in itemurl

        if (req.session.theUser == undefined) { //when user is not logged in
            item.find({ itemcode: item_code }, function (err, itemdata) {//query to get itemdetails
                if (err) throw err;
                //specificuserrating is the function which returns the average user rating by passing userId as arg it is required from feedbackDB
                specificuserrating(itemdata[0].UserId).then(function (avgval) {
                    res.render('items', { sendinfo: itemdata[0], avguserrat: avgval })
                }).catch(function (err) { console.log(err) })
            })
        }
        else {//when user is logged in
            var UserId = req.session.theUser.UserId;
            var firstName = req.session.theUser.firstName;

            if (req.session.ratednow != undefined) {
                var ratednow = req.session.ratednow;
                delete req.session.ratednow;
            }
            var query = {
                $and: [                                   /*query to check if the item is in offer table */
                    { $or: [{ 'status': 'pending' }, { 'status': 'swapped' }] },  /*query is done on offers db to use the offer details for getting offer feedback */
                    { $or: [{ 'offererId': UserId }, { 'offereeId': UserId }] },  /*And also the query helps in showing the swap avilable button only for the users involved in the swap*/
                    { $or: [{ 'offereritemId': item_code }, { 'offereeitemId': item_code }] }
                ]
            }
            offer.find(query).then(function (offerdata) {

                if (offerdata.length != 0) {
                    item.find({ itemcode: item_code })
                        .then(function (item) {
                            specificuserrating(item[0].UserId)//getuser rating to show in the ejs page
                                .then(function (avgval) {
                                    if (item[0].UserId == UserId || offerdata[0].status == 'swapped') {//condition for item rating by user who own it or the one who swapped it
                                        itemFeedback.find({ UserId: UserId, itemcode: item_code })//query to send itemrating to ejs page
                                            .then(function (itemfeedback) {
                                                if (itemfeedback.length != 0) {
                                                    var rating = itemfeedback[0].rating
                                                }
                                                else {
                                                    var rating = 0;
                                                }
                                                if (offerdata[0].status == 'swapped' && item[0].UserId != UserId) {//condition to rate the swapper who involved in the swap
                                                    var rateswapper = [1];
                                                    userFeedback.find({ offerId: offerdata[0].offerId, UserId1: UserId, UserId2: item[0].UserId })//query to get the ratings between two users for specific offer
                                                        .then(function (userfeedbackdata) {
                                                            if (userfeedbackdata.length != 0) {
                                                                var userrating = userfeedbackdata[0].rating;//user rating to show on ejs page
                                                            } else {
                                                                var userrating = 0;
                                                            }
                                                            if (offerdata[0].offererId == UserId) {         //sending hidden parameters to use for adduserfeedback
                                                                var UserId2 = offerdata[0].offereeId;
                                                            } else if (offerdata[0].offereeId == UserId) {
                                                                var UserId2 = offerdata[0].offererId
                                                            }

                                                            res.render('items', { sendinfo: item[0], UserId2: UserId2, offerId: offerdata[0].offerId, Userfname: firstName, session: [1], status: item[0].itemstatus, rating: rating, ratednow: ratednow, avguserrat: avgval, rateswapper: rateswapper, userrating: userrating })
                                                        }).catch(function (err) { console.log(err) })

                                                } else {//can only rate the items
                                                    res.render('items', { sendinfo: item[0], Userfname: firstName, session: [1], status: item[0].itemstatus, rating: rating, ratednow: ratednow, avguserrat: avgval })
                                                }

                                            }).catch(function (err) { if (err) throw err })
                                    } else {//can oly view the ratings
                                        res.render('items', { sendinfo: item[0], Userfname: firstName, session: [1], status: item[0].itemstatus, avguserrat: avgval })
                                    }
                                }).catch(function (err) { console.log(err) })


                        }).catch(function (err) { console.log(err) })

                }
                else {//not in offer collection so can participate in swap
                    item.find({ itemcode: item_code })
                        .then(function (item) {
                            if (item.length != 0) {
                                specificuserrating(item[0].UserId)//gets user rating
                                    .then(function (avgval) {
                                        if (item[0].UserId == req.session.theUser.UserId) {
                                            itemFeedback.find({ UserId: UserId, itemcode: item_code })
                                                .then(function (itemfeedback) {
                                                    if (itemfeedback[0].length != 0) {
                                                        var rating = itemfeedback[0].rating
                                                    }
                                                    else {
                                                        var rating = 0;
                                                    }
                                                    res.render('items', { sendinfo: item[0], Userfname: firstName, session: [1], status: 'unknown', rating: rating, ratednow: ratednow, avguserrat: avgval })
                                                }).catch(function (err) { console.log(err) })
                                        }
                                        else {
                                            res.render('items', { sendinfo: item[0], Userfname: firstName, session: [1], status: 'unknown', userownitem: 'no', avguserrat: avgval })
                                        }
                                    }).catch(function (err) {
                                        console.log(err)
                                    })

                            }
                            else {
                                var errors = [{
                                    msg: 'invalid itemcode',
                                    value: item_code
                                }]
                                res.render('error', { errors: errors, session: [1], Userfname: req.session.theUser.firstName })
                            }
                            //console.log(item)

                        }).catch(function (err) {
                            console.log(err)
                        })
                }

            }).catch(function (err) {
                console.log(err)
            })
        }

    }


});
//about route
app.get('/about', function (req, res) {
    if (req.session.theUser == undefined) {
        res.render('about');
    }
    else {
        res.render('about', { session: [1], Userfname: req.session.theUser.firstName });
    }

});
//contact route
app.get('/contact', function (req, res) {
    if (req.session.theUser == undefined) {
        res.render('contact');
    }
    else {
        res.render('contact', { session: [1], Userfname: req.session.theUser.firstName });
    }
});
//404 route
app.use(function (req, res, next) {
    res.status(404).send("no information available or requested")
});
app.listen(3000, '127.0.1.1');