var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var offer=require('./OfferDB').offer
var item=require('./itemDB').item
var userFeedbackSchema=new Schema({
    offerId:{type:String,require:true,ref:'offer',field:'offerId'},
    UserId1:{type:Number,require:true,ref:'user', field:'UserId'},
    UserId2:{type:Number,require:true,ref:'user', field:'UserId'},
    rating:{type:Number,require:true}
},{ versionKey: false,collection:'user-userfeedback',toObject: { virtuals: true }})

userFeedbackSchema.index({offerId:1,UserId1:1},{unique:true})

userFeedbackSchema.virtual('offerusers',{
    ref:'offer',
    localField:'offerId',
    foreignField:'offerId',
    justOne: true
})

var itemFeedbackSchema=new Schema({
    itemcode:{type:String,required:true,ref:'item',field:'itemcode'},
    UserId:{type:Number,required:true,ref:'user', field:'UserId'},
    rating:{type:Number,required:true}
},{ versionKey: false,collection:'user-itemfeedback',toObject: { virtuals: true }})

itemFeedbackSchema.index({itemcode:1,UserId:1},{unique:true})

var userFeedback=mongoose.model('userFeedback',userFeedbackSchema)
var itemFeedback=mongoose.model('itemFeedback',itemFeedbackSchema)

/** addofferfeedback method to add rating for user/swapper */
var addOfferFeedback=function(offerId,UserId1,UserId2,rating){
    return new Promise(function(resolve,reject){
        /**check whether the offer is swapped or not */
        offer.find({offerId:offerId,status:'swapped',$or:[{offererId:UserId1},{offereeId:UserId1}]},function(err,offer){
            
            if(offer.length!=0){
                /**add feedback if exists update if not create new */
               userFeedback.findOneAndUpdate({offerId:offerId,UserId1:UserId1,UserId2:UserId2},{rating:rating},
                {upsert:true,new:true},function(err,userrating){
                    if(err) throw err;
                    if(userrating.length!=0){
                        resolve(userrating)
                        console.log('user: '+UserId1+' rated user: '+UserId2+'with rating: '+rating)
                    }else{
                        console.log('you cannot rate this user')
                    }
                })
            }
            else{
                console.log('offer is still in pending status or invalid offerId and UserID1 ')
            }
        })
        
    })
    
}
/** additemfeedback method to add rating for swapped item/owned item */

var addItemFeedback=function(itemcode,UserId,rating){
    return new Promise(function(resolve,reject){
        var itempromise=item.find({itemcode:itemcode,UserId:UserId});/* validation to rate owned item*/
        var offerpromise=offer.find({'status':'swapped'},
        {$or:[{'offererId':UserId},{'offereeId':UserId}]},
        {$or:[{'offereritemId':itemcode},{'offereeitemId':itemcode}]})/* validation to rate swapped item*/

        Promise.all([itempromise,offerpromise]).then(function(value){
            if(value.length!==0){/**condition to add feedback */
                itemFeedback.findOneAndUpdate({UserId:UserId,itemcode:itemcode},{rating:rating},{upsert:true,new:true},function(err,data){
                    if(err) throw err;
                    if(data.length!=0){

                    /**update item with average rating */
                    itemFeedback.find({itemcode:itemcode}).then(function(feedback){
                        if(feedback.length!=0){
                            var sum=0;
                          feedback.forEach(function(data){
                              sum=sum+data.rating;
                          })
                         
                          var avg=sum/feedback.length;
                           item.findOneAndUpdate({itemcode:itemcode},{rating:avg},{new:true},function(err,item){
                            if(err) throw err;
                            console.log('item: '+item.itemcode+' rating:'+item.rating)
                           })
                           
                        }
                    })
                }
                    console.log('item with itemcode: '+data.itemcode+' is rated by: '+data.UserId+' rating: '+data.rating)
                    resolve(data)
                })
            }
            else{
                console.log('sorry you cannot rate this item')
            }
        })
    })
}
/**function to get specific useritem returns the average rate of the swapper */
var specificuserrating=function(UserId){
    return new Promise(function(resolve,reject){
        userFeedback.find({UserId2:UserId}).then(function(userfeedback){
            if(userfeedback.length!=0){
                var sum=0;
                userfeedback.forEach(function(data){
                    sum=sum+data.rating;
                })
                //console.log(sum)
                var avg=sum/userfeedback.length;
                
            }
            else{
               var avg=0;
            }
            resolve(avg)
        }).catch(function(err){console.log(err)})
    })
}
module.exports.addOfferFeedback=addOfferFeedback;
module.exports.specificuserrating=specificuserrating;
module.exports.addItemFeedback=addItemFeedback;
module.exports.itemFeedback=itemFeedback;
module.exports.userFeedback=userFeedback;
