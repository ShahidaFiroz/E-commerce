var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const async = require("hbs/lib/async");
// const { reject } = require("bcrypt/promises");
// const { ObjectId } = require("mongodb");
const collections = require("../config/collections");

const { response } = require("../app");
const { resolve, reject } = require("promise");
const { pipeline } = require("stream");
const { ObjectId } = require("mongodb");
//const { promiseImpl } = require("ejs");
// const { ObjectId } = require("mongodb");
// const { data } = require("jquery");
const objectId = require("mongodb").ObjectId;
const Razorpay = require('razorpay');
const { options } = require("../routes");
const paypal=require('paypal-rest-sdk');
const { getExpectedBodyHash } = require("twilio/lib/webhooks/webhooks");

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AcW54zGz6MVf4HppUxmrjRSCMecSbvLQlXFmpdngltZ45zsN-IGDK7y5wTvfcsmuDqbgN7UD0UV57hvs',
  'client_secret': 'EMD225qxldJ0I7oNT7PVJRO2ozPXGn-hnRWJpTHt3u-PYWfJsibVPwnlQtPYhSnTimQja9vq7-NoNdBN'
});

var instance = new Razorpay({
  key_id: 'rzp_test_QywbAzHQepqHYD',
  key_secret: 'SkReWKXBMWZfzuht1c6i319S',
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      //   console.log("bcrypt");
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.confirm_password = await bcrypt.hash(
        userData.confirm_password,
        10
      );

      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne({ email: userData.email }, { $set: { status: true } });
          resolve(data);
        });
    });
  },
  signUp:(email)=>{
 //   console.log('funtion');
   
    return new Promise(async(resolve,reject)=>{
  //    console.log('promise');
      let response={}
      let emails=await db.get().collection(collection.USER_COLLECTION).findOne({email:email.email})
   //   console.log(emails);
      if(emails){
   //    console.log('true');
        resolve({status:true})
      }
      else{
      //  console.log('false');
        resolve({status:false})
      }
      
    })

  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      // let loginStatus =false
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
           // console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          //  console.log("login failed");
          }
        });
      } else {
       // console.log("Login failed");
        resolve({ status: false });
      }
    });
  },
  checkUser: (userData) => {
    return new Promise(async (resolve) => {
      let response = [];
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email })
        .then((data) => {
        //  console.log(data);
          if (data) {
            response.status = true;
            response.user = true;
            resolve(response);
          } else {
            response.status = false;
          //  console.log(response.status);
            resolve(response);
          }
        });
    });
  },
  //change password in user profile
  changepassword:(data,id)=>{
    console.log("OOOOOOOOOO");
    console.log(data);
    console.log(data.oldpass);
    console.log(data.newpass);
    return new Promise(async(resolve)=>{
      let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(id)})
      if(user)
      {
        bcrypt.compare(data.oldpass,user.password).then(async(status)=>{
          if(status)
          {
            let password=await bcrypt.hash(data.newpass,10)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(id)},{$set:{password:password}}).then((response)=>{
              response.status=true
              resolve(response)
            
            })
            
          }else{
            resolve({status:false})
          }
        })
        
      }
    })
  },
         
    

  
  
  getAllUsers: () => {
    return Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(user);
    });
  },
  blockUsers: (userId) => {
   // console.log(userId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, { $set: { status: false } })
        .then((data) => {
          resolve(data);
        });
    });
  },
  unblockUsers: (userId) => {
   // console.log(userId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, { $set: { status: true } })
        .then((data) => {
          resolve(data);
        });
    });
  },

  removeOffer: (prId) => {
    // console.log(userId);
     return new Promise((resolve, reject) => {
       db.get()
         .collection(collection.PRODUCT_COLLECTION)
         .updateOne({ _id: objectId(prId) }, { $set: { offer_status:'',discount:0,finalprice:0,offerpercent:0,offer:0 } })
         .then((data) => {
           resolve(data);
         });
     });
   },
 
  getAllUser: () => {
    return new Promise(async function (resolve, reject) {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: objectId(userId) })
        .then((response) => {
         // console.log(response);
          resolve(response);
        });
    });
  },

  getUserdetails: (val) => {
    console.log("ggg");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(val) })
        .then((response) => {
        //  console.log("kkk");
          resolve(response);
        });
    });
  },

  updateUser: (id, userData) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          { $set: { email: userData.email, username: userData.username } }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  addAddress:(address,callback)=>{
    
db.get().collection("address").insertOne(address).then((data)=>{
  callback(data.insertedId)
})
  },




  addProduct: (product, callback) => {
    
    console.log(product);
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        
        //console.log(data);
        callback(data.insertedId);
      });
  },
  getAllProducts: () => {
    // console.log('1111111111111111111111111111111111111111111111');
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
     // console.log(products);
      resolve(products);
    });
  },
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      console.log(prodId);
      console.log(objectId(prodId));
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .remove({ _id: objectId(prodId) })
        .then((response) => {
          //console.log(response);
          resolve(response);
        });
    });
  },
  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(prodId) })
        .then((product) => {
          resolve(product);
        }).catch(()=>{
          reject(err)
        })    
    })
  },
  updateProduct: (prodId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              Name: proDetails.Name,
              Description: proDetails.Description,
              price: proDetails.price,
              Quantity: proDetails.Quantity,
              Category: proDetails.Category,
            },
            
          },
          {upsert:true}
        )
        .then((response) => {
          resolve();
        });
    });
  },
  getCategoryName:()=>{
 return new Promise(async(resolve,reject)=>{
  let catg=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
resolve(catg)
 })


  },
  //new fn for user profile
  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) })
        .then((user) => {
          resolve(user);
        });
    });
  },
  getAllAddress: (userId) => {
    // console.log('1111111111111111111111111111111111111111111111');
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({userId:userId})
        .toArray();
        console.log("reached here");
      console.log(address);
      resolve(address);
    });
  },
  deleteAddress: (Id) => {
    return new Promise((resolve, reject) => {
      console.log(Id);
      console.log(objectId(Id));
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .remove({ _id: objectId(Id) })
        .then((response) => {
          //console.log(response);
          resolve(response);
        });
    });
  },
  getAddressDetails: (Id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ _id: objectId(Id) })
        .then((address) => {
          console.log("6666666666");
          console.log(address);
          console.log("777777777");
          resolve(address);
        });
    });
  },





  updateAddress: (Id, addDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .updateOne(
          { _id: objectId(Id) },
          {
            $set: {
              address: addDetails.address,
              place:addDetails.place,
              city:addDetails.city,
              zip:addDetails.zip,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  getAllCoupon:()=>{
    return new Promise(async(resolve,reject)=>{
      let coupon=await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
     // console.log(coupon);
      resolve(coupon)
    })
  },


  getAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
     // console.log(category);
      resolve(category);
    });
  },
  addCategory: (category,callback) => {
   // console.log(category);
    db.get()
      .collection("category")
      .insertOne(category)
      .then((data) => {
      //  console.log(data);
        callback(data.insertedId);
      });
  },
  deleteCategory: (catId) => {
    return new Promise((resolve, reject) => {
     // console.log(catId);
     // console.log(objectId(catId));
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .remove({ _id: objectId(catId) })
        .then((response) => {
         // console.log(response);
          resolve(response);
        });
    });
  },
  getCategoryDetails: (catId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectId(catId) })
        .then((category) => {
          resolve(category);
        });
    });
  },
  updateCategory: (catId, catDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: objectId(catId) },
          {
            $set: {
              CName: catDetails.CName,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  checkCategory: (catData) => {
    return new Promise(async (resolve) => {
      let response = [];
      let cat = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({CName:catData.CName})
        
          //console.log(cat);
          if (cat) {
            response.status = true;
            //console.log("gggggggggggggggg")
            resolve(response);
          } else {
            response.status = false;
           // console.log(response.status);
            resolve(response);
          }
        
    })

},
addToCart:(prodId,userId)=>{
  //console.log("DDDDDDDDDDDDDDDDD");
  let proObj={
    item:objectId(prodId),
    quantity:1
  }
  return new Promise(async(resolve,reject)=>{
    let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
  if(userCart){
     let proExist=userCart.products.findIndex(product=>product.item==prodId)
    // console.log(proExist);
     if(proExist!=-1)
     
     {
      db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':objectId(prodId)},
      {
        $inc:{'products.$.quantity':1}
      }
      
  ).then(()=>{
    resolve({status:false})
  })
  
    }  else{

    
   db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
     {
      $push:{products:proObj}
       }
     ).then((response)=>{
      resolve({status:true})
     })
    }
  }else{
    let cartObj={
      user:objectId(userId),
      products:[proObj]
    }
    db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
      resolve({status:true})
    })
  }
  })
},
getCartProducts: (userId) => {
  return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
              $match: { user: ObjectId(userId) }
          },

          {
              $unwind: '$products'
          },
           {
              $project: {
                  item: '$products.item',
                  quantity: '$products.quantity'
              }
          },
          {
              $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
              }
          },
          {
              $project: {
                  item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
              }
          }

      ]).toArray()
     // console.log(cartItems);
      resolve(cartItems)
  })


},
addToWishlist:(prodId,userId)=>{
  let proObj={
    item:objectId(prodId),
    quantity:1
  }
  return new Promise(async(resolve,reject)=>{
    let userWish=await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({user:objectId(userId)})
  if(userWish){
     let wishExist=userWish.products.findIndex(product=>product.item==prodId)
   
     if(wishExist!=-1)
     
     {
      resolve({status:false})
      // db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({'products.item':objectId(prodId)},
      // {
      //   $inc:{'products.$.quantity':1}
      //}
      
  // ).then(()=>{
  //   resolve()
  // })
  
    }  else{

    
   db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({user:objectId(userId)},
     {
      $push:{products:proObj}
       }
     ).then((response)=>{
      resolve({status:true})
     })
    }
  }else{
    let wishObj={
      user:objectId(userId),
      products:[proObj]
    }
    db.get().collection(collection.WHISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
      resolve({status:true})
    })
  }
  })
},
getWishProducts:(userId)=>{
return new Promise(async (resolve, reject) => {
  console.log("aaaaaaaaaaaaaaa")
  let wishItems = await db.get().collection(collection.WHISHLIST_COLLECTION).aggregate([
      {
          $match: { user: objectId(userId) }
      },

      {
          $unwind: '$products'
      },
       {
          $project: {
              item: '$products.item',
              quantity: '$products.quantity'
          }
      },
      {
          $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'product'
          }
      },
      {
          $project: {
              item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
      }

  ]).toArray()
 // console.log(cartItems);
  resolve(wishItems)
})


},
getWish:()=>{
  return new Promise(async(resolve,reject)=>{
    let wish=await db.get().collection(collection.WHISHLIST_COLLECTION).find().toArray()
    resolve(wish)
  })
},


getCartCount:(userId)=>{
 // console.log("calllget");
  return new Promise(async(resolve,reject)=>{
    let count=0
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    //console.log(cart)
 if(cart){
 // console.log('carttttttttttttttttttttttttttttt5555555555555555');
  count=cart.products.length
 // console.log(count);
  resolve(count)
 }
 else{
// console.log(count)
 resolve(count)
 }
  })
},

getWishCount:(userId)=>{
 
   return new Promise(async(resolve,reject)=>{
     let wcount=0
     let wish=await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({user:objectId(userId)})  
  if(wish){
  wcount=wish.products.length
  resolve(wcount)
  }
  else{
 resolve(wcount)
  }
   })
 },

changeProductQuantity:(details)=>{
  details.count=parseInt(details.count)
  details.quantity=parseInt(details.quantity)

  return new Promise((resolve,reject)=>{
    if(details.count==-1 && details.quantity==1 ){
    db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
    {
      $pull:{products:{item:ObjectId(details.product)}}
    }
   
).then((response)=>{

  resolve({removeProduct:true})
})
  }else{
    db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
    {
      $inc:{'products.$.quantity':details.count}
    }
    ).then((response)=>{
 
      resolve({status:true})
    })
  }
  })

},
getTotals:(orderId)=>{
  return new Promise(async(resolve,reject)=>{
    let totals=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
    resolve(totals)
 
  })
},
getTotalamount:(userId)=>{
  return new Promise(async (resolve, reject) => {
    let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
            $match: {user: objectId(userId) }
        },

        {
            $unwind: '$products'
        },
         {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity'
            }
        },
        {
            $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
            }
        },
        {
          $group:{
            _id:null,
            total:{$sum:{$multiply:['$quantity','$product.price']}}
          }
        }

    ]).toArray()
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$");
      //console.log(total);
    if(total[0]){
      resolve(total[0].total)
      console.log(total[0].total);
    }else
    {
      
      resolve(0)
    }
   
   
})
},

getTotalOfferamount:(userId)=>{
  return new Promise(async (resolve, reject) => {
    let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
            $match: {user: objectId(userId) }
        },

        {
            $unwind: '$products'
        },
         {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity'
            }
        },
        {
            $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
            }
        },
        {
          $project: {
              item: 1, quantity: 1, product:1,finalprice: { $cond:{if:('$product.offer'),then:{$sum:{$multiply:['$quantity',{$toInt:'$product.finalprice'}]}
          },else:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}
            
            }}
          }},
        
        
        {
          $group:{
            _id:null,
            total:{$sum:'$finalprice'}
            
          
          }
            
          }
        

    ]).toArray()
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$");
      //console.log(total);
    if(total[0]){
      resolve(total[0].total)
      console.log(total[0].total);
    }else
    {
      
      resolve(0)
    }
   })
},

deleteCartProduct:(details)=>{
  return new Promise((resolve,reject)=>{
  db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
  {
    $pull:{products:{item:objectId(details.product)}}
  }
 
).then((response)=>{

resolve({removeProduct:true})
})
})
},
deleteWishProduct:(details)=>{
  return new Promise((resolve,reject)=>{


  db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({_id:objectId(details.wish)},
  {
    $pull:{products:{item:objectId(details.product)}}
  }).then((response)=>{

resolve({removeProduct:true})
})
})
},
addBanner: (banner, callback) => {
 
  db.get()
    .collection("banner")
    .insertOne(banner)
    .then((data) => {
    callback(data.insertedId);
    });
},
getAllBanners: () => {
   return new Promise(async (resolve, reject) => {
    let banners = await db
      .get()
      .collection(collection.BANNER_COLLECTION)
      .find()
      .toArray();
    resolve(banners);
  });
},
getCategoryProducts:(catname)=>{
  return new Promise(async(resolve,reject)=>{
    let prodata=await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:catname}).toArray()
    resolve(prodata)
  })
},
getCategoryUser:()=>{
  return new Promise(async(resolve,reject)=>{
    let categorys=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    resolve(categorys)
  })
},
getProducts:()=>{
  return new Promise(async(resolve,reject)=>{
    let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    resolve(products)
  })
},
getCategoryUser:()=>{
  return new Promise(async(resolve,reject)=>{
    let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
    console.log(category);
    resolve(category)
  })
},
getCartProductLists:(userId)=>{
 
return new Promise(async(resolve,reject)=>{
  console.log("ethi");
let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
console.log(cart.products)
resolve(cart.products)
})
},
generatePaypal:(orderId,total)=>{
  return new Promise((resolve,reject)=>{
      
          const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "Paypal"
            },
            "redirect_urls": {
                "return_url": "https://shahidafiroz.in/success",
                "cancel_url": "https://shahidafiroz.in/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Red Sox Hat",
                        "sku": "001",
                        "price": total,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": total
                },
                "description": "Hat for the best team ever"
            }]
        };
         paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
              throw error;
          } else {
            resolve(payment)
          }
        })
         })

        },
placeOrder:(order,products,couponfinal)=>{
  return new Promise(async(resolve,reject)=>{
    let status=order['payment-method']==='COD'?'Placed':'Pending'
    let orderObj={
     address:objectId(order.address),
      userId:objectId(order.userId),
      paymentMethod:order['payment-method'],
      products:products,
      totalAmount:couponfinal,
      status:status,
      date:new Date().toDateString(),
      time:new Date()
    }
    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
      db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
      resolve(response.insertedId)
   })
  })
},
generateRazorpay:(orderId,total)=>{
  return new Promise(async(resolve,reject)=>{
    //var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

var options={
  amount: total * 100,
  currency: "INR",
  receipt: ""+ orderId
}
instance.orders.create(options,function(err,order){
   if(err)
   {
    console.log(err);

 }else{
 
  console.log("New Order :",order)
  resolve(order)
 }
})
  
})
  },
  verifyPayment:(details)=>{
    return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256','SkReWKXBMWZfzuht1c6i319S');
     hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
      hmac=hmac.digest('hex')
      if(hmac==details['payment[razorpay_signature]'])
      {
        resolve()
      }else{
        reject()
      }
    })

},
changePaymentStatus:(orderId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
   {
    $set:{
      status:'placed'
    }
   }).then(()=>{
      resolve()
    })
  })
},




getadddorders: (orderId) => {
  return new Promise(async (resolve, reject) => {
      let add = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
              $match: { userId: ObjectId(orderId) }
          },

          {
            $lookup: {
                from: collection.ADDRESS_COLLECTION,
                localField: 'address',
                foreignField: '_id',
                as: 'addresses'
            }
        },
        {
          $lookup: {
              from: collection.USER_COLLECTION,
              localField: 'userId',
              foreignField: '_id',
              as: 'userphone'
          }
      },
          {
            $project: {
                item: '$products.item',
              
                addresses:1,
                totalAmount:1,
                status:1,
                date:1,
                paymentMethod:1,
                userphone:1

    

            }
        },
        {
            $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        },
        {$sort:{_id:-1}},

      ]).toArray()
  resolve(add)
  })
},
cancelOrder: (Id) => {
  return new Promise((resolve, reject) => {
    console.log(Id);
    console.log(objectId(Id));
    db.get()
      .collection(collection.ORDER_COLLECTION)
      .updateOne(
        { _id: objectId(Id) },
        {$set:{status:'cancelled'}})
      .then((response) => {
        resolve();
      });
  });
},
shipOrder: (Id) => {
  return new Promise((resolve, reject) => {
    console.log(Id);
    console.log(objectId(Id));
    db.get()
      .collection(collection.ORDER_COLLECTION)
      .updateOne(
        { _id: objectId(Id) },
        {$set:{status:'shipped'}})
      .then((response) => {
         resolve();
      });
  });
},
getAdminOrderslists: (orderId) => {
  return new Promise(async (resolve, reject) => {
      let adminord = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $lookup: {
                from: collection.ADDRESS_COLLECTION,
                localField: 'address',
                foreignField: '_id',
                as: 'addresses'
            }
        },
        {
          $lookup: {
              from: collection.USER_COLLECTION,
              localField: 'userId',
              foreignField: '_id',
              as: 'userphone'
          }
      },
      
         {
            $project: {
                item: '$products.item',
              
                addresses:1,
                totalAmount:1,
                status:1,
                date:1,
                paymentMethod:1,
                userphone:1
            }
        },
        {
            $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        },
        {$sort:{_id:-1}},

      ]).toArray()
      resolve(adminord)
  })

},
OrderStatus: (Id) => {
  return new Promise((resolve, reject) => {
    console.log(Id);
    console.log(objectId(Id));
    db.get()
      .collection(collection.ORDER_COLLECTION)
      .updateOne(
        { _id: objectId(Id) },
        {$set:{status:'cancelled'}})
      .then((response) => {
        resolve();
      });
  });
},


cancelOrderAdmin: (Id) => {
  // console.log(userId);
   return new Promise((resolve, reject) => {
     db.get()
       .collection(collection.ORDER_COLLECTION)
       .updateOne({ _id: objectId(Id) }, {$set:{ status:'cancelled'}})
       .then((response) => {
         resolve();
       })
   })
 },

 shipOrderAdmin: (Id) => {
  // console.log(userId);
   return new Promise((resolve, reject) => {
     db.get()
       .collection(collection.ORDER_COLLECTION)
       .updateOne({ _id: objectId(Id) }, {$set:{ status:'shipped'}})
       .then((response) => {
         resolve();
       })
   })
 },
 deliverOrderAdmin: (Id) => {
  // console.log(userId);
   return new Promise((resolve, reject) => {
     db.get()
       .collection(collection.ORDER_COLLECTION)
       .updateOne({ _id: objectId(Id) }, {$set:{ status:'Delivered'}})
       .then((response) => {
         resolve();
       })
   })
 },
 checkCoupon: (couponData) => {
  return new Promise(async (resolve) => {
    let response = [];
    let coupon = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .findOne({CouponName:couponData.CouponName})

        if (coupon) {
          response.status = true;
          resolve(response);
        } else {
          response.status = false;
          resolve(response);
        }    
  })

},
addCoupon: (coupon,callback) => {
   db.get()
     .collection("coupon")
     .insertOne(coupon)
     .then((data) => {
       callback(data.insertedId);
     });
 },
 deleteCoupon: (couponId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.COUPON_COLLECTION)
      .remove({ _id: objectId(couponId) })
      .then((response) => {
        resolve(response);
      });
  });
},

//to get coupon inside cart
getCoupons:()=>{
  return new Promise(async(resolve,reject)=>{
    let coupon=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
    resolve(coupon)
  })
},

getCouponprice:(name)=>{
  return new Promise(async(resolve,reject)=>{
let coupon=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(name)})
    console.log("7777777777777");
     if(coupon){
 let couppr=await db.get().collection(collection.COUPON_COLLECTION).findOne({CouponName:coupon.coupon})
    console.log("ddddddddddddd");
    console.log(couppr);
     resolve(couppr)
    }else{
      console.log("kkkkk");
      let couppr=0
      console.log(couppr);
      resolve(couppr)
    }
  })
},
///......................................


checkuserCoupon: (couponData) => {
  return new Promise(async (resolve) => {
    let response = [];
    let coupon = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({CouponName:couponData.CouponName})
      
        //console.log(cat);
        if (coupon) {
          response.status = true;
          //console.log("gggggggggggggggg")
          resolve(response);
        } else {
          response.status = false;
         // console.log(response.status);
          resolve(response);
        }
      
  })

},


adduserCoupon:(coupondata,userId)=>{
  console.log("reached here")
  return new Promise(async(resolve,reject)=>{
  let response={}
    // let dCoupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({coupondata:coupondata.coupon})
      code=coupondata.coupon
      console.log("code:"+code);
      //console.log("dCoupon:"+dCoupon);
     if(code){
      console.log("hello");
         response.status=true
    let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId),code})
    if(user){
        response.status=false
        console.log(response);
        resolve(response)
        
    }
    else {
      response.status=true
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
        {
            $set:{
                coupon:code,
                 coupon_status:true
            }
        })
        db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
        {
            $set:{
              coupon:code
            }
        })
      console.log(response);
     resolve(response)
    }
      } else{
        console.log("coupon else");
          response.status=false
          console.log(response);
          resolve(response)
      }
  })


},
addoffer: (offer) => {
  return new Promise ((resolve,reject)=>{
    db.get()
    .collection(collection.OFFER_COLLECTION).insertOne(offer)
    .then((data) => {
      resolve(data)
  })
  
     });
 },
 checkOffer: (offData) => {
  return new Promise(async (resolve) => {
    let response = [];
    let off = await db
      .get()
      .collection(collection.OFFER_COLLECTION)
      .findOne({OName:offData.OName})
      
        console.log(off);
        if (off) {
          response.status = true;
        console.log("gggggggggggggggg")
          resolve(response);
        } else {
          response.status = false;
         console.log(response.status);
          resolve(response);
        }
      
  })

},


getSearch :(detail)=>{
  return new Promise(async (resolve, reject) => {
    console.log(detail)
    detail=detail.toString()
    let data=await db.get().collection(collection.PRODUCT_COLLECTION).find({

      Name:{
        $regex:detail,
        $options:"$i"

      }
    }).toArray()
    resolve(data)
    console.log(data);
})
},

getAllOffer: () => {
  return new Promise(async (resolve, reject) => {
    let offer= await db
      .get()
      .collection(collection.OFFER_COLLECTION)
      .find()
      .toArray();
   // console.log(category);
    resolve(offer);
  });
},
applyProductoffer: (prodId, offer) => {
  return new Promise(async(resolve, reject) => {
  let product= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)})
  let offerdata=await db.get().collection(collection.OFFER_COLLECTION).findOne({_id:objectId(offer.OName)})
  console.log("***********")
  console.log(product)
  console.log("eeeeeeeeeee");
  console.log(offerdata)
  //console.log(offname)
   let offerAmount=offerdata.offer
   
   console.log(offerAmount)
   let discount=product.price*offerAmount/100
   console.log(discount)
   let finalprice=product.price-discount
   console.log(finalprice)
   
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .updateOne(
        { _id: objectId(prodId) },
        { 
          $set: 
          { offer:offer.OName,
            discount:discount,
            finalprice:finalprice,
            offerpercent:offerAmount,
            offer_status:true

           },
         } )
      .then((response) => {
       // console.log(offproducts)
        resolve();
      });
  });
},

getOfferdetails: (id) => {
  console.log("ggg");
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.OFFER_COLLECTION)
      .findOne({ _id: objectId(id) })
      .then((response) => {
      //  console.log("kkk");
        resolve(response);
      });
  });
},

getDailySales: () => {
  return new Promise(async (resolve, reject) => {

    let dailysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: {
          "status": { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      },
      {
        $sort: { _id: 1 },
      }
    ]).toArray()
    resolve(dailysales)
    console.log(dailysales);
  })
},
getMonthlySales:()=>{

  return new Promise(async (resolve, reject) => {

    let monthlysale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: {
          "status": { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$time" } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      },
      {
        $sort: { _id: 1 },
      }
    ]).toArray()
    resolve(monthlysale)
    console.log(monthlysale);
  })





},
getyearlySales:()=>{

  return new Promise(async (resolve, reject) => {

    let sale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: {
          "status": { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$time" } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      },
      {
        $sort: { _id: 1 },
      }
    ]).toArray()
    resolve(sale)
    console.log(sale);
  })





},
//................coupon test start


getCartByUser: (id) => {
  return new Promise(async (resolve, reject) => {
    let cart = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOne({ user: ObjectId(id) });
    resolve(cart);
  });
},


getCouponData: (data) => {
  return new Promise(async (resolve, reject) => {
    let coupon = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .aggregate([
        {
          $match: {
            CouponName: data.CouponName,
          },
        },
      ])
      .toArray();
    resolve(coupon[0]);
  });
},
couponCheck: (userId, couponCode) => {
  return new Promise(async (resolve, reject) => {
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });

    let list = user.used_coupons;
    let couponUsed = false;
    for (let i = 0; i <= list.length; i++) {
      couponUsed = false;

      if (list[i] == couponCode) {
        couponUsed = true;
        break;
      }
    }

    console.log(couponUsed);
    resolve(couponUsed);
  });
},


getAppliedCoupon:(Id)=>{
 
      return new Promise(async(resolve,reject)=>{
        console.log("ethi");
      let coupondetails=await db.get().collection(collection.COUPON_COLLECTION).findOne({CouponName:Id})
      console.log(coupondetails)
      resolve(coupondetails)
      
      })
      
      },

addcoupontocart: (coupon, id) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.CART_COLLECTION)
      .updateOne(
        { user: ObjectId(id) },
        {
          $set: {
            coupon_offer: coupon.offer,
            coupon_offer_status: coupon.status,
          },
        },
        {
          upsert: true,
        }
      );
    resolve();
  });
},

removeCouponFromCart: (id) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.CART_COLLECTION)
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            coupon_offer: parseInt(0),
            coupon_offer_status: false,
          },
        }
      )
      .then((response) => {
        resolve();
      });
  });
},

//.............coupon test end
}




  // removeCoupon: (id) => {
  //     return new Promise(async (resolve, reject) => {
  //         let usercart = await db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(id) }, {
  //             $set: {
  //                 coupon: 1,
  //                 couponName: "",
  //                 couponnum: 0

  //             }
  //         }).then((response) => {
  //             console.log(response);
  //             resolve({ status: true })
  //         })

  //     })
  // },





//   deleteCoupon: (id) => {
//     return new Promise((resolve, reject) => {
//         db.get().collection(collection.COUPON_COLLETION).deleteOne({ _id: ObjectId(id) }).then(() => {
//             resolve({status:true})
//         })
//     })
// }



// addBanner: (data) => {
//   return new Promise((resolve, reject) => {
//       let image = {}
//       image.name = data.filename
//       console.log(image);
//       db.get().collection(collection.BANNER_COLLETION).insertOne(image).then(() => {

//           resolve()
//       })
//   })
// },

// getBanner: () => {
//   return new Promise(async (resolve, reject) => {
//       let banner = await db.get().collection(collection.BANNER_COLLETION).find().sort({ name: -1 }).toArray()
//       resolve(banner)
//   })
// },
// delectBanner: (data) => {
//   return new Promise((resolve, reject) => {
//       db.get().collection(collection.BANNER_COLLETION).remove({ _id: ObjectId(data) }).then(() => {
//           resolve({status:true})
//       })
//   })
// },

