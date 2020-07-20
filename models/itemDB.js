var express = require('express');
var mongoose = require('mongoose');

var user = require('./UserDB').user;

// var db= mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true })

var Schema = mongoose.Schema;

var itemsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    itemcode: { type: String, unique: true, required: true },
    UserId: { type: Number },
    itemname: { type: String, required: true },
    itemsname: { type: String, required: true },
    catalogcategory: { type: String, required: true },
    itemby: { type: String, required: true },
    description: { type: String, required: true },
    detaildescription: { type: String },
    rating: { type: Number, default: 0 },
    imgurl: { type: String, required: true },
    catalogcategoryurl: { type: String, required: true },
    itemstatus: { type: String, default: 'available' },
  },
  {
    versionKey: false,
    collection: 'items',
    toObject: { virtuals: true },
  }
);

/**static method to get allitems from db */
itemsSchema.statics.getallitems = function ({}, cb) {
  return this.find({}, cb);
};
/**static method to get item with specific itemcode from db */
itemsSchema.statics.getitembyitemcode = function (itemcode, cb) {
  if (!itemcode) {
    return this.find({}, cb);
  } else {
    return this.find({ itemcode: itemcode }, cb);
  }
};
/**static method to get specific useritems */
itemsSchema.statics.getuseritems = function (UserId, cb) {
  return this.find({ UserId: UserId }, cb);
};
/**static method to get otherthan useritems */
itemsSchema.statics.getotherthanuseritems = function (
  UserId,
  catalogcategory,
  cb
) {
  if (!catalogcategory) {
    return this.find(
      { UserId: { $ne: UserId }, itemstatus: { $ne: 'swapped' } },
      cb
    );
  } else {
    return this.find(
      {
        UserId: { $ne: UserId },
        itemstatus: { $ne: 'swapped' },
        catalogcategory: catalogcategory,
      },
      cb
    );
  }
};

/**static method to getitems by category */
itemsSchema.statics.getitemsbycategory = function (catalogcategory, cb) {
  if (!catalogcategory) {
    return this.find({ itemstatus: { $ne: 'swapped' } }, cb);
  } else {
    return this.find(
      { catalogcategory: catalogcategory, itemstatus: { $ne: 'swapped' } },
      cb
    );
  }
};

/**static method to remove useritems */
itemsSchema.statics.removeuseritem = function (UserId, itemcode, cb) {
  return this.findOneAndRemove({ UserId: UserId, itemcode: itemcode }, cb);
};
/**static method to upate item status */
itemsSchema.statics.updateItemstatus = function (itemcode, status, cb) {
  return this.findOneAndUpdate(
    { itemcode: itemcode },
    { itemstatus: status },
    cb
  );
};
var item = mongoose.model('item', itemsSchema);

/**add new item method */
var additem = function (
  itemcode,
  UserId,
  itemname,
  itemsname,
  catalogcategory,
  itemby,
  description,
  detaildescription,
  imgurl
) {
  var Newitem = {
    itemcode: itemcode,
    UserId: UserId,
    itemname: itemname,
    itemsname: itemsname,
    catalogcategory: catalogcategory,
    itemby: itemby,
    description: description,
    detaildescription: detaildescription,
    imgurl: imgurl,
    catalogcategoryurl: encodeURIComponent(catalogcategory),
  };

  addItem(Newitem);
};

var addItem = function (Item) {
  var newitem = new item(Item);
  user.find({ UserId: newitem.UserId }, function (err, user) {
    if (err) throw err;
    if (user.length != 0) {
      newitem.save(function (err) {
        if (err) {
          console.log('error at additem ' + err);
        } else {
          console.log(
            'item with item code :' + Item.itemcode + ' is saved to data base'
          );
        }
      });
    } else {
      console.log(
        'UserId doesnot exists so newitem cannot be created with new userID'
      );
    }
  });
};
module.exports.item = item;
