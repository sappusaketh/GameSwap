var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var item = require('./itemDB').item;
// var db= mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true })

var offerCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false, collection: 'counter' }
);

var offersSchema = new Schema(
  {
    offerId: { type: String, required: true, unique: true },
    offererId: { type: Number, ref: 'user', required: true },
    offereritemId: { type: String, ref: 'item', required: true },
    offereeId: { type: Number, ref: 'user', required: true },
    offereeitemId: { type: String, ref: 'item', required: true },
    status: { type: String, default: 'pending' },
  },
  {
    versionKey: false,
    collection: 'offers',
    toObject: { virtuals: true },
  }
);
/**virtuals for items in offer collection */
offersSchema.virtual('offereritem', {
  ref: 'item',
  localField: 'offereritemId',
  foreignField: 'itemcode',
  justOne: true,
});
offersSchema.virtual('offereeitem', {
  ref: 'item',
  localField: 'offereeitemId',
  foreignField: 'itemcode',
  justOne: true,
});

/**update offer method */
offersSchema.statics.updateOffer = function (offerId, status, cb) {
  return new Promise(function (resolve, reject) {
    if (status == 'Accepted' || status == 'Rejected' || status == 'withdrawn') {
      if (status == 'Accepted') {
        var update = { itemstatus: 'swapped' };
        var offerstatus = { status: 'swapped' };
      } else if (status == 'Rejected') {
        var update = { itemstatus: 'available' };
        var offerstatus = { status: 'Rejected' };
      } else if (status == 'withdrawn') {
        var update = { itemstatus: 'available' };
        var offerstatus = { status: 'withdrawn' };
      }

      offer
        .find({ offerId: offerId })
        .then(function (offerdetails) {
          /**query to update item status when offer is updated */

          if (status == 'Rejected' || status == 'withdrawn') {
            if (status == 'Rejected') {
              var itemquery1 = { itemcode: offerdetails[0].offereritemId };
              var itemquery2 = { itemcode: offerdetails[0].offereeitemId };
            } else {
              var itemquery1 = { itemcode: offerdetails[0].offereeitemId };
              var itemquery2 = { itemcode: offerdetails[0].offereritemId };
            }
            item.update(itemquery1, update, function (err, res) {
              if (err) throw err;
            });

            offer.find(
              {
                $or: [
                  { offereeitemId: offerdetails[0].offereeitemId },
                  { offereritemId: offerdetails[0].offereeitemId },
                  { offereeitemId: offerdetails[0].offereritemId },
                  { offereritemId: offerdetails[0].offereritemId },
                ],
                status: 'pending',
              },
              function (err, data) {
                if (err) throw err;
                if (data.length == 1) {
                  item.update(itemquery2, update, function (err, res) {
                    if (err) throw err;
                  });
                }
              }
            );
          } else if (status == 'Accepted') {
            var query = {
              $or: [
                { itemcode: offerdetails[0].offereritemId },
                { itemcode: offerdetails[0].offereeitemId },
              ],
            };

            item.update(query, update, { multi: true }, function (err, res) {
              if (err) throw err;
            });
          }

          /*offer update*/
          offer.findOneAndUpdate(
            { offerId: offerId },
            offerstatus,
            { new: true },
            function (err, updatedoffer) {
              if (err) {
                reject(err);
              } else {
                if (updatedoffer.status == 'swapped') {
                  /*item status update when offer is accepted*/

                  /**check if there are multiple offers made by user and update the other item status */
                  offer.find(
                    {
                      $or: [
                        { offereeitemId: updatedoffer.offereeitemId },
                        { offereritemId: updatedoffer.offereeitemId },
                      ],
                      status: 'pending',
                    },
                    function (err, offersarray) {
                      if (offersarray.length != 0) {
                        for (var i = 0; i < offersarray.length; i++) {
                          offer.findOneAndUpdate(
                            { offerId: offersarray[i].offerId },
                            {
                              status:
                                'already swapped by user/ better offer found',
                            },
                            { new: true },
                            function (err, updated) {
                              if (err) throw err;
                              console.log(
                                updated.offerId + ': ' + updated.status
                              );
                            }
                          );
                          /**if user who accepted the offer is offered by other offer (offeree of another offer)
                           * then change the offerer item status to available so that he can swap with others item
                           */
                          if (
                            offersarray[i].offereeitemId ==
                            updatedoffer.offereeitemId
                          ) {
                            item.findOneAndUpdate(
                              { itemcode: offersarray[i].offereritemId },
                              { itemstatus: 'available' },
                              { new: true },
                              function (err, updateditem) {
                                if (err) throw err;
                                console.log(
                                  'updateditem:' + updateditem.itemname
                                );
                              }
                            );
                          } else if (
                            /**if user who accepted the offer is offered an other offer before he got the offer which he/she accepted now(offerer)
                             * then change the offeree item status to available so that he can swap with others item
                             */
                            offersarray[i].offereritemId ==
                            updatedoffer.offereeitemId
                          ) {
                            item.findOneAndUpdate(
                              { itemcode: offersarray[i].offereeitemId },
                              { itemstatus: 'available' },
                              { new: true },
                              function (err, updateditem) {
                                if (err) throw err;
                                console.log(
                                  'updateditem:' + updateditem.itemname
                                );
                              }
                            );
                          }
                        }
                      } else {
                        console.log('only one offer found');
                      }
                    }
                  );
                }
                resolve(updatedoffer);
              }
            }
          );
        })
        .catch(function (err) {
          console.log('error at updating item: ' + err);
        });
    } else {
      console.log('status cannot be changed to ' + status);
    }
  });
};

var offercounter = mongoose.model('offercounter', offerCounterSchema);
var offer = mongoose.model('offer', offersSchema);

var addoffer = function (offererId, offereritemId, offereeId, offereeitemId) {
  var Newoffer = {
    offererId: offererId,
    offereritemId: offereritemId,
    offereeId: offereeId,
    offereeitemId: offereeitemId,
  };
  Addoffer(Newoffer);
};
/**add offer method
 * this method first increases the cffercounter based on the count of offers in offer db and assigns that value to offerID
 * then saves the new offer to collection
 * if there is any err in saving the offer counter will be updated by reducing the seq by 1
 * else offer will be saved and the itemstatus of the items in that offer will be updated
 *
 */
var Addoffer = function (Newoffer) {
  offercounter
    .findByIdAndUpdate(
      { _id: 'offerCounter' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    .then(function (count) {
      Newoffer.offerId = 'offer' + count.seq;
      var newoffer = new offer(Newoffer);

      newoffer.save(function (err, res) {
        if (err) {
          offercounter
            .findByIdAndUpdate(
              { _id: 'offerCounter' },
              { $inc: { seq: -1 } },
              { new: true, upsert: true }
            )
            .then(function (count) {})
            .catch(function (error) {
              console.error('counter error-> : ' + error);
              throw error;
            });
          console.log('error from add offer: ' + err);
        } else {
          //update item status to pending
          var query = {
            $or: [
              { itemcode: newoffer.offereritemId },
              { itemcode: newoffer.offereeitemId },
            ],
          };
          var update = { itemstatus: 'pending' };
          item.update(query, update, { multi: true }, function (err, res) {
            if (err) throw err;
          });
          console.log(
            'newoffer with offerID: ' +
              res.offerId +
              ' and offererId: ' +
              res.offererId +
              ' is saved'
          );

          //console.log(res)
        }
      });
    })
    .catch(function (error) {
      console.error('counter error-> : ' + error);
      throw error;
    });
};
/**removes the offer  when a item belong to a specific offer is removed/deleted
 * returns the documents which are deleted
 */

var removeOffer = function (UserId, itemcode) {
  return new Promise(function (resolve, reject) {
    var query = {
      $or: [{ offererId: UserId }, { offereeId: UserId }],
      $or: [{ offereritemId: itemcode }, { offereeitemId: itemcode }],
    };

    offer.find(query, function (err, docs) {
      if (err) throw err;
      offer.deleteMany(query, function (error, data) {
        if (error) {
          reject(error);
        } else if (data.n !== 0) {
          resolve(docs);
        }
      });
    });
  });
};
/**method to get all the offers belong to a certain user with offereritem and offeree item fields being populated */
var useroffers = function (UserId) {
  return new Promise(function (resolve, reject) {
    offer
      .find({ $or: [{ offererId: UserId }, { offereeId: UserId }] })
      .populate('offereritem', 'itemstatus itemsname')
      .populate('offereeitem', 'itemstatus itemsname')
      .then(function (useroffers) {
        resolve(useroffers);
      })
      .catch(function (err) {
        return reject(err);
      });
  });
};

module.exports.removeOffer = removeOffer;
module.exports.offer = offer;
module.exports.addoffer = addoffer;
module.exports.useroffers = useroffers;
