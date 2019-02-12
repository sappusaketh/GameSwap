var express = require('express');

var { check, validationResult } = require('express-validator/check');

var isAlphanumeric = require('is-alphanumeric')

var UserDB = require('../models/UserDB');
var itemdb = require('../models/itemDB');
var saltHashPassword = require('../models/crypto').saltHashPassword;
var sha512 = require('../models/crypto').sha512;
var addremoveditem = require('../models/deletedDB').addremoveditem;
var addremovedoffer = require('../models/deletedDB').addremovedoffer;
var FeedbackDB = require('../models/FeedbackDB');

var user = UserDB.user;
var item = itemdb.item;
var offer = require('../models/OfferDB').offer;
var removeOffer=require('../models/OfferDB').removeOffer;
var addoffer = require('../models/OfferDB').addoffer;
var useroffers = require('../models/OfferDB').useroffers



var app = express();

var router = module.exports = express.Router();

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');


app.use('/resources', express.static('resources'));

var theUser = function (req, res, next) {
    if (req.session.theUser == undefined) {

    }
    else {

    }
    next()
}
router.use(theUser)
/*get signup route */
router.get('/signup', function (req, res) {
    res.render('signup')
})
/**signup route with validations on all the input fields before adding information to DB
 * Username,email shouldbe unique
 * username is alphanumeric
 * password should not contail special characters and length should not exceed 5
 * sha512 is used to hash the password and password is not stored in db directlys
 * firstname,lastname,city,state,country are alpha
 * zipcode should be an integer with length of 5
 * address can be alphanumeric with few required special characters and length should not exceed 50
 */
router.post('/signup', urlencodedParser, [check('Username').not().isEmpty().withMessage('username is required')
    .isAlphanumeric().withMessage('Username contains invalid characters')
    .custom(function (value, { req }) {
        return new Promise(function (resolve, reject) {
            user.findOne({ Username: req.body.Username }, function (err, data) {
                if (err) {
                    reject(new Error('internal error'))
                }
                else if (Boolean(data)) {
                    reject(new Error('username is already taken try again with new one'))
                }
                resolve(true)
            })
        })
    }).trim(), check('password').not().isEmpty().withMessage('Password cannot be empty')
        .isAlphanumeric().withMessage('password contains invalid characters')
        .isLength({ min: 5 }).withMessage('password should contain atleast 5 characters').trim(),
check('cpassword').custom(function (value, { req }) {
    return new Promise(function (resolve, reject) {
        if (value != req.body.password) {
            reject(new Error('confirm password does not matches with password'))
        }
        resolve(true)
    })
}).trim(),
check('firstName').isAlpha().withMessage('firstname contains invalid characters')
    .isLength({ max: 20 }).withMessage('first name should only contain max of 20 letters').trim(),
check('lastName').isAlpha().withMessage('lastname contains invalid characters')
    .isLength({ max: 20 }).withMessage('Last name should only contain max of 20 letters').trim(),
check('email').isEmail().withMessage('invalid email')
    .custom(function (value, { req }) {
        return new Promise(function (resolve, reject) {
            user.findOne({ EmailAddress: value }, function (err, data) {
                if (err) {
                    reject(new Error('internal error'))
                }
                else if (data) {
                    reject(new Error('Email already in use'))
                }
                resolve(true)
            })
        })
    })
    , check('address').trim()
        .custom(function (value) {
            return new Promise(function (resolve, reject) {
                if (value) {
                    var addregex = new RegExp("^[A-Za-z0-9'\\.\\-\\s\\,]{1,50}$", 'g');//regex to allow only necessary char for add field
                    var check = addregex.test(value)
                    if (check == true) {
                        resolve(true)
                    }
                    else {
                        reject(new Error('invalid address'))
                    }

                }
                else {
                    resolve(true)
                }
            })
        }), check('city').trim()
            .custom(function (value) {
                return new Promise(function (resolve, reject) {
                    if (value) {
                        var cityregex = new RegExp('^[a-zA-Z]+(?:[ -][a-zA-Z]+)*$', 'g')
                        if (cityregex.test(value)) {
                            resolve(true)
                        }
                        else {
                            reject(new Error('invalid city'))
                        }

                    }
                    else {
                        resolve(true)
                    }
                })
            }), check('state').trim()
                .custom(function (value) {
                    return new Promise(function (resolve, reject) {
                        if (value) {
                            var stateregex = new RegExp('^[a-zA-Z ]{1,25}$', 'g')
                            if (stateregex.test(value)) {
                                resolve(true)
                            }
                            else {
                                reject(new Error('invalid state'))
                            }

                        }
                        else {
                            resolve(true)
                        }
                    })
                }), check('Country').trim()
                    .custom(function (value) {
                        return new Promise(function (resolve, reject) {
                            if (value) {
                                var countryregex = new RegExp('^[a-zA-Z ]{1,35}$', 'g')
                                if (countryregex.test(value)) {
                                    resolve(true)
                                }
                                else {
                                    reject(new Error('invalid country'))
                                }

                            }
                            else {
                                resolve(true)
                            }
                        })
                    }), check('zipcode').trim()
                        .custom(function (value) {
                            return new Promise(function (resolve, reject) {
                                if (value) {
                                    var zipcoderegex = new RegExp('^[0-9]{1,5}$', 'g')
                                    if (zipcoderegex.test(value)) {
                                        resolve(true)
                                    }
                                    else {
                                        reject(new Error('invalid zipcode'))
                                    }

                                }
                                else {
                                    resolve(true)
                                }
                            })
                        })
]

    , function (req, res, next) {
        var validationerrors = validationResult(req)

        if (!validationerrors.isEmpty()) {
            var allerrors = validationerrors.array();
            delete req.body.password;
            delete req.body.cpassword;
            res.render('signup', { errorsarray: allerrors, data: req.body })
        }
        else {

            var Username = req.body.Username
            var password = req.body.password
            var firstName = req.body.firstName
            var lastName = req.body.lastName
            var EmailAddress = req.body.email
            var Address1 = req.body.address
            var City = req.body.city
            var State = req.body.state
            var PostCode = Number(req.body.zipcode)
            var Country = req.body.Country
            var passworddata = saltHashPassword(password)
            var salt = passworddata.salt;
            var hash = passworddata.passwordHash;

            var newuser = UserDB.addUser(Username, hash, salt, firstName, lastName, EmailAddress, Address1, City, State, PostCode, Country)
            var AddUser = UserDB.AddUser;
            AddUser(newuser).then(function (data) {
/**after succesful registration user is redirected to a page with login link on it */
                res.render('signup', { firstname: data.firstName, register: [1] })
            }).catch(function (err) {
                console.log(err)
            })
        }


    })
/**login if user is logged in will be redirected to the page from where he clicked login
 */
router.get('/login', function (req, res, next) {

    if (req.session.theUser == undefined) {
        if (req.headers.referer == 'http://127.0.1.1:3000/myitems') {
            req.session.redirectTo = 'myitems';
        }
        else if (req.headers.referer == 'http://127.0.1.1:3000/myswaps') {
            req.session.redirectTo = 'myswaps'
        }
        else {
            delete req.session.redirectTo
        }
        res.render('login')
    }
    else {
        res.render('index', { session: [1], Userfname: req.session.theUser.firstName })
    }
})
/**validates user email and password
 * validates email if email exists in the db gets the hash and salt to verify the password
 * adds the user id and user data to session
 */
router.post('/login', urlencodedParser, [check('Email').exists().isEmail().normalizeEmail(),
check('password').exists().isAlphanumeric().trim()
], function (req, res, next) {
    var Email = req.body.Email;

    var password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        loginerrorsarray = errors.array();
     
/*method to show errors next to the respective field if email is invalid shows error next to email field in UI */
        var errorparam = function () {
            var errorparamarray = []
            loginerrorsarray.forEach(function (errorarray) {
                errorparamarray.push(errorarray.param)
            });
            return errorparamarray
        };
        var email;
        var err = errorparam()
        if (err.includes('Email')) {
            loginerrorsarray.forEach(function (errors) {
                if (errors.param == 'Email') {
                    email = errors.value;
                    return email;
                }
            })

        }
        else {
            email = Email
        }
        res.render('login', { loginerrors: loginerrorsarray, Email: email, errorparamarray: err })

    }
    else {
        user.findOne({ EmailAddress: Email }, function (err, data) {
            if (err) throw err;
            if (data) {
                var userpassword = sha512(password, data.salt)
                if (userpassword.passwordHash == data.hash) {
                    console.log(data.EmailAddress + ' logged in')
                    req.session.theUser = data;
                    if (req.session.redirectTo != undefined) {
                        var redirectTo = req.session.redirectTo
                        delete req.session.redirectTo;
                        res.redirect(redirectTo)
                    }
                    else {
                        res.render('index', { session: [1], Userfname: req.session.theUser.firstName })
                    }
                }
                else {
                    res.render('login', { Email: Email, message: 'password does not match with the username/email please try again' })
                }

            }
            else {
                res.render('login', { Email: Email, message: 'invalid user name/password please try again' })
            }
        })
    }

})
/**logout */
router.post('/logout',urlencodedParser,[check('logoutbutton').isAlpha()], function (req, res, next) {
    if(req.body.logoutbutton=='logout'){
        if (req.session.theUser != undefined) {
            console.log(req.session.theUser.UserId + ' logged out/session ended');
        }
        else {
            console.log('session ended');
        }
    
        req.session.destroy();
    }else{
        console.log('invalid action')
    }
    res.render('index')
})

/**if user is logged in gets user items using getuseritems and with userID stored in session */
router.get('/myitems', function (req, res, next) {

    if (req.session.theUser == undefined) {

        res.render('myitems');

    }
    else {
        item.getuseritems(req.session.theUser.UserId, function (err, data) {
            if (err) throw err;
            req.session.UserItems = data;
            req.session.save();
            var allitems = req.session.UserItems;
            res.render('myitems', { allitems: allitems, Userfname: req.session.theUser.firstName, session: [1] });

        })
    }

})
/**if user is logged in gets user offers using useroffers method  with userID stored in session  as arg */
router.get('/myswaps', function (req, res, next) {
    if (req.session.theUser == undefined) {
        res.render('myswaps');
    }
    else {
        useroffers(req.session.theUser.UserId).then(//{$and:
            function (offer) {

                var allitems = offer
                var pendingstatus = allitems.some(function (el) {
                    return (el.status == 'pending');
                });
                var swappedstatus = allitems.some(function (el) {
                    return (el.status == 'swapped');
                });

                if (offer.length != 0) {

                    res.render('myswaps', { allitems: allitems, swappedstatus: swappedstatus, pendingstatus: pendingstatus, session: [1], Userfname: req.session.theUser.firstName, UserId: req.session.theUser.UserId })
                }
                else {
                    res.render('myswaps', { allitems: [], swappedstatus: swappedstatus, session: [1], pendingstatus: pendingstatus, Userfname: req.session.theUser.firstName, UserId: req.session.theUser.UserId });
                }

            }).catch(function (err) {
                if (err) throw err;
            })
    }
})


/**catalog category route if no parameter is passed shows all the items which do not belong to user */
router.get('/categories?:catalogcategory', function (req, res) {

    var catalogcategory = req.query.catalogcategory;
    var catregex = RegExp('^[a-zA-Z\\d\\s]{1,20}$', 'g');
    if (catalogcategory == undefined || (catalogcategory != undefined && catregex.test(catalogcategory))) {
        if (req.session.theUser == undefined) {
            item.getitemsbycategory(catalogcategory, function (err, data) {

                if (err) throw err;
                var uniquecategories = [...new Set(data.map(function (item) { //set is object which has only unique values
                    return item.catalogcategory;
                }))];

                var catobj = data;

                res.render('categories', { catobj: catobj, uniquecategories: uniquecategories });
            })
        }
        else {
            item.getotherthanuseritems(req.session.theUser.UserId, catalogcategory, function (err, data) {
                if (err) throw err;
                var uniquecategories = [...new Set(data.map(function (item) { //set is object which has only unique values
                    return item.catalogcategory;
                }))];
                var catobj = data;
                res.render('categories', { catobj: catobj, session: [1], uniquecategories: uniquecategories, Userfname: req.session.theUser.firstName });
            })
        }

    }

    else {
        if (req.session.theUser == undefined) {
            var session = undefined;
            var Userfname = undefined
        }
        else {
            var session = [1];
            var Userfname = req.session.theUser.firstName
        }
        res.render('categories', { catalogcategory: catalogcategory, error: 'invalid category', session: session, Userfname: Userfname })
    }


});

/**all post requests such as update */
router.post('/action*', urlencodedParser, [check('action', 'invalid action').isAlpha().trim(),
check('itemList', 'invalid itemcode').isAlphanumeric().trim()
], function (req, res, next) {

    var action = req.body.action;


    console.log('requested action: ' + action);
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.session.theUser.UserId != undefined) {
            var Userfname = req.session.theUser.firstName;
            var session = [1]
        }
        else {
            //everything  is undefined
        }
        res.render('error', { errors: errors.array(), Userfname: Userfname, session: session })
    }
    else {
        if (action == 'update' || action == 'Accept' || action == 'Reject' || action == 'withdrawswap' || action == 'delete' || action == 'offer' ) {
            var itemcode = req.body.itemList;
            if (action == 'update') {
                item.getitembyitemcode(itemcode, function (err, data) {
                    if (err) throw err;
                    if (data[0].UserId == req.session.theUser.UserId) {
                        if (data[0].itemstatus == 'pending') {
                            res.redirect('myswaps')
                        }
                        else {

                            res.redirect('items?itemcode=' + itemcode)
                        }
                    }
                    else {
                        res.send('this is not your item')
                    }


                })

            }
            else if (action == 'Accept' || action == 'Reject' || action == 'withdrawswap') {
                var offerId = req.body.offerId;

                if (action == 'Reject') {
                    var query = offer.find({ offerId: offerId, offereeId: req.session.theUser.UserId })
                    query.exec(function (err, data) {
                        if (data.length != 0) {
                            offer.updateOffer(offerId, 'Rejected').then(function(result){
                                if(result){
                                    res.redirect('myitems')
                                    console.log(offerId + ' is  rejected')
                                }
                                
                            }).catch(function(err){               
                                console.log('error from reject:' + err)
                            })
                        }
                        else {
                            console.log('you are not the authorized user to reject the offer')
                        }
                    })
                }
                else if (action == 'withdrawswap') {
                    var query = offer.find({ offerId: offerId, offererId: req.session.theUser.UserId })
                    query.exec(function (err, data) {
                        if (data.length != 0) {
                            offer.updateOffer(offerId, 'withdrawn').then(function(result){
                                if(result){
                                    res.redirect('myitems')
                                    console.log(offerId + ' is  Withdrawn')
                                }
                            }).catch(function(err){               
                                console.log('error from withdraw:' + err)
                            })
                            
                        }
                        else {
                            console.log('you are not the authorized user to withdraw the offer')
                        }
                    })
                }
                else if (action == 'Accept') {
                    var query = offer.find({ offerId: offerId, offereeId: req.session.theUser.UserId })
                    query.exec(function (err, data) {
                        if (data.length != 0) {
                            offer.updateOffer(offerId, 'Accepted').then(function(result){
                                if(result){
                                    res.redirect('myitems')
                                    console.log(offerId + ' is  Accepted')
                                }
                            }).catch(function(err){               
                                console.log('error from accept:' + err)
                            })
                            
                        }
                        else {
                            console.log('you are not the authorized user to accept the offer')
                        }
                    })
                }

            }
            else if (action == 'delete') {
                item.removeuseritem(req.session.theUser.UserId, itemcode).then(function (result) {
                    var removeditem = result;
                    if (result) {
                        addremoveditem(removeditem)
                    }
                    removeOffer(req.session.theUser.UserId, itemcode).then(function(data)  {
                        var removedoffer = data;
                        if (data.length!==0) {
                            removedoffer.forEach(function(rmoffer){
                                if (rmoffer.offereritemId == itemcode) {
                                    item.updateItemstatus(rmoffer.offereeitemId, 'available', function (err, data) {
                                        if (err) throw err;
                                        console.log(data.itemcode + ' status set to available')
                                    })
                                }
                                else if (rmoffer.offereeitemId == itemcode) {
                                    item.updateItemstatus(rmoffer.offereritemId, 'available', function (err, data) {
                                        if (err) throw err;
                                        console.log(data.itemcode + ' status set to available')
                                    })
                                }
                                else {
                                    console.log('invalid offer')
                                }
                                addremovedoffer(rmoffer, req.session.theUser.UserId);
                            })
                            
                        }

                    }).catch(function (err) {
                        console.log(err)
                    })

                    res.redirect('myitems')
                }).catch(function (err) {
                    console.log(err)
                })


            }
            else if (action == 'offer') {
                var itempromise = item.find({ itemcode: itemcode })
                
                var swapitemspromise = item.find({ UserId: req.session.theUser.UserId, itemstatus: 'available' }, ['itemcode', 'itemsname'])
                Promise.all([itempromise, swapitemspromise]).then(function ([item, swapitemlist]) {
                   
                    if (item.length != 0 && item[0].UserId != req.session.theUser.UserId) {

                        if (swapitemlist.length != 0) {
                            console.log('Swap offer requested for ' + item[0].itemname)
                            var swapitemlistobj = JSON.stringify(swapitemlist)
                            var itemobj = JSON.stringify(item[0])
                            res.render('swap', { swapitemlistobj: swapitemlistobj, itemobj: itemobj, sendinfo: item[0], swapitemlist: swapitemlist, Userfname: req.session.theUser.firstName, session: [1] })
                        }
                        else {
                            FeedbackDB.specificuserrating(item[0].UserId)
                            .then(function (avgval) {
                            res.render('items', { sendinfo: item[0], avguserrat: avgval, msg: [1], Userfname: req.session.theUser.firstName, session: [1] })
                            })
                        }

                    }
                    else {
                        var errorsarray = [{
                            param: 'itemcode',
                            msg: 'itemcode doesnot exists/this item belongs to you'
                        }]

                        res.render('items', { errors: errorsarray, session: [1], Userfname: req.session.theUser.firstName })
                    }

                }).catch(function (err) {
                    console.log(err)
                })
            }

        }
        else {

            res.redirect('myitems')
            console.log('requested action cannot be performed')
        }
    }


})
router.post('/confirmswap', urlencodedParser, [check('offereeId').isInt().trim(),
check('offereeitemId').isAlphanumeric().trim()], function (req, res) {

    var errors = validationResult(req);
    if (!errors.isEmpty) {
        console.log(errors.array)
    }
    else {
        var offererId = req.session.theUser.UserId;
        var swapitem = req.body.swapitem;
        var offereeId = req.body.offereeId;
        var offereeitemId = req.body.offereeitemId;
        if (swapitem != undefined) {
            if (isAlphanumeric(swapitem) && swapitem.length < 10 && Number.isInteger(offererId)) {
                var query = item.find({ UserId: offererId, itemcode: swapitem, itemstatus: 'available' })

                query.exec(function (err, data) {
                    if (data.length != 0 && offereeId != offererId) {
                        item.find({ UserId: offereeId, itemcode: offereeitemId }, function (err, offereeitem) {
                            if (offereeitem.length != 0) {
                                addoffer(offererId, swapitem, offereeId, offereeitemId)
                                res.redirect('myswaps')
                            }
                            else {
                                var errors = [{
                                    msg: 'this item is not available for swap/invalid item code',
                                    value: swapitem
                                }]
                                res.render('error', { errors: errors, Userfname: req.session.theUser.firstName, session: [1] })
                            }

                        })

                    }
                    else {
                        var errors = [{
                            msg: 'this item does not belong to you/invalid item code',
                            value: swapitem
                        }]
                        res.render('error', { errors: errors, Userfname: req.session.theUser.firstName, session: [1] })
                    }
                })

            }
            else {
                var errors = [{
                    msg: 'invalid item code',
                    value: swapitem
                }]
                res.render('error', { errors: errors, Userfname: req.session.theUser.firstName, session: [1] })
            }


        }
        else {
            var wantitem = JSON.parse(req.body.wantitem)
            var swapitemlist = JSON.parse(req.body.swapitemlist);
            res.render('swap', { swapitemlistobj: req.body.swapitemlist, itemobj: req.body.wantitem, sendinfo: wantitem, swapitemlist: swapitemlist, Userfname: req.session.theUser.firstName, session: [1], selectany: 'none' })
        }

        //console.log(swapitem)

    }


})
router.post('/rating', urlencodedParser, [check('itemcode', 'invalid itemcode').isAlphanumeric().trim(),
check('rating', 'invalid value').isFloat({ min: 1.0, max: 5.0 }).trim(),
check('starrating').isAlpha().trim()], function (req, res, next) {
    //console.log(req.body)
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array())
    }
    else {
        var UserId = req.session.theUser.UserId;
        var itemcode = req.body.itemcode;
        var rating = req.body.rating;
        if (req.body.starrating == 'useritemrating') {
            FeedbackDB.addItemFeedback(itemcode, UserId, rating).then(function (feedback) {
                if (feedback.length != 0) {
                    req.session.ratednow = 'item';
                    res.redirect('items?itemcode=' + itemcode)
                }
            }).catch(function (err) { console.log(err) })
        }
        else if (req.body.starrating == 'useruserrating') {
            var offerId = req.body.offerId;

            var UserId2 = req.body.UserId2;
            FeedbackDB.addOfferFeedback(offerId, UserId, UserId2, rating).then(function (userrating) {
                if (userrating.length != 0) {
                    req.session.ratednow = 'user';
                    res.redirect('items?itemcode=' + itemcode)
                }
            }).catch(function (err) { console.log(err) })
        }



    }
})
