var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var db= mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true })//db connectivity

deletedItemSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    itemcode: { type: String },
    UserId: { type: Number },
    itemname: { type: String },
    itemsname: { type: String },
    catalogcategory: { type: String },
    itemby: { type: String },
    description: { type: String },
    detaildescription: { type: String },
    rating: { type: Number },
    imgurl: { type: String },
    catalogcategoryurl: { type: String },
    itemstatus: { type: String },
    id: { type: String },
  },
  { strict: true, versionKey: false, collection: 'deleted items' }
);

deletedOfferSchema = new Schema(
  {
    offerId: { type: String },
    offererId: { type: Number },
    offereritemId: { type: String },
    offereeId: { type: Number },
    offereeitemId: { type: String },
    status: { type: String },
    id: { type: String },
    deletedby: { type: Number },
  },
  { strict: true, versionKey: false, collection: 'deleted offers' }
);

var deletedItem = mongoose.model('deletedItem', deletedItemSchema);
var deletedOffer = mongoose.model('deletedoffer', deletedOfferSchema);

var addremoveditem = function (removedItem) {
  var RemovedItem = {
    UserId: removedItem.UserId,
    itemname: removedItem.itemname,
    itemsname: removedItem.itemsname,
    catalogcategory: removedItem.catalogcategory,
    itemby: removedItem.itemby,
    description: removedItem.description,
    detaildescription: removedItem.detaildescription,
    imgurl: removedItem.imgurl,
    catalogcategoryurl: removedItem.catalogcategoryurl,
    rating: removedItem.rating,
    itemstatus: removedItem.itemstatus,
    id: removedItem.id,
  };
  /**method to add the deleted item to collection */
  var Newdeleteditem = new deletedItem(RemovedItem);

  Newdeleteditem.save(function (err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log('deleted item is saved to the collection');
    }
  });
};
/**method to add the deleted offer to collection */
var addremovedoffer = function (removedOffer, deletedby) {
  var RemovedOffer = {
    offerId: removedOffer.offerId,
    offererId: removedOffer.offererId,
    offereritemId: removedOffer.offereritemId,
    offereeId: removedOffer.offereeId,
    offereeitemId: removedOffer.offereeitemId,
    id: removedOffer.id,
    deletedby: deletedby,
  };

  var Newdeletedoffer = new deletedOffer(RemovedOffer);
  Newdeletedoffer.save(function (err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log('deleted offer is saved to the collection');
    }
  });
};

module.exports.addremoveditem = addremoveditem;
module.exports.addremovedoffer = addremovedoffer;
