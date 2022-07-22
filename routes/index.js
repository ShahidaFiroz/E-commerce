var express = require("express");
const async = require("hbs/lib/async");
const { response, render } = require("../app");
var router = express.Router();
const otp = require("../routes/otp");
const userHelper = require("../helpers/user-helper");
const { config } = require("process");
const { count } = require("console");
const session = require("express-session");
const { resolve } = require("path");
const client = require("twilio")(otp.AccountSID, otp.authToken);
const paypal=require('paypal-rest-sdk')
//const Swal = require('sweetalert2');
//var session= require('express-session')
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};


 //home products all
 router.get('/show-productAll',async(req,res)=>{
  //console.log("kkkkkkkkkkkkkk")
  let catproducts=await userHelper.getProducts()
  console.log(catproducts);
  req.session.categoryproducts=catproducts
  res.redirect('/prod')
})
//home products based upon categories
router.get('/show-products/:CName',async(req,res)=>{
  
  let catproducts=await userHelper.getCategoryProducts(req.params.CName)
  
    req.session.categoryproducts=catproducts
 
    res.redirect('/')
  })

  //router for redirect home page
  router.get('/prod',(req,res,next)=>{

    userHelper.getAllProducts().then((products)=>{
    // console.log("gfffffffffffffffffffffffffhfgff");
     //console.log(products)
     req.session.categoryproducts=products
     res.redirect('/')
    })
  
 })

router.get("/",async(req, res, next)=> {
  let category=await userHelper.getCategoryUser()
  //let products=req.session.categoryproducts
   userHelper.getAllBanners().then((banners)=>{
    // userHelper.getAllCategory().then((category)=>{
      // userHelper.getAllProducts().then((products)=>{
        if (req.session.loggedIn) {

          userHelper.getCartCount(req.session.user._id).then((count)=>{
            userHelper.getWishCount(req.session.user._id).then((wcount)=>{
          // console.log(count)
           let userloged = req.session.user;
           if(req.session.categoryproducts)
           {
            let products=req.session.categoryproducts
            res.render("user/index", { user: true, userloged,count,banners,category,products,wcount});
           }else{
            userHelper.getAllProducts().then((products)=>{
               req.session.categoryproducts=products
               res.render("user/index", { user: true, userloged,count,banners,category,products,wcount});
            })
           }
          
          })
        })
        }else{
          if(req.session.categoryproducts)
          {
           let products=req.session.categoryproducts
           res.render("user/index", { user: true,banners,category,products});
          }else{
           userHelper.getAllProducts().then((products)=>{
              req.session.categoryproducts=products
              res.render("user/index", { user: true,banners,category,products});
           })
          }
         
        } 
     //  })


  
   
  })
})
// })

router.get('/myprofile',verifyLogin,async(req,res)=>{
   user=req.session.user
   let userloged = req.session.user;
   userHelper.getCartCount(req.session.user._id).then((count)=>{
    userHelper.getWishCount(req.session.user._id).then((wcount)=>{
  //  let id = req.params;
   // let users=await userHelper.getUserDetails(id)
  res.render("user/my-profile", { user: true,user:req.session.user,userloged,count,wcount});
})

   })
  })
//new profile view address

router.get('/viewaddress',verifyLogin,function(req,res){
  user=req.session.user
  let userloged = req.session.user;
  userHelper.getCartCount(req.session.user._id).then((count)=>{
    userHelper.getWishCount(req.session.user._id).then((wcount)=>{
  userHelper.getAllAddress(req.session.user._id).then((address)=>{
    console.log("success address");
   console.log(address)
    res.render('user/view-address',{user:true,userloged,address,count,wcount,user:req.session.user})
  })
})
  })
})
router.get('/delete-address/:id',(req,res)=>{
  let Id=req.params.id
 // console.log(prodId)
  userHelper.deleteAddress(Id).then((response)=>{
    res.redirect('/viewaddress')

  })
})

router.get('/edit-address/:id',verifyLogin, async(req,res)=>{
  console.log(req.params.id+"66666666666666666666666");
  let address=await userHelper.getAddressDetails(req.params.id)
 // console.log(category)
  res.render('user/edit-address',{address,user:true})
})
router.post('/edit-address/:id',(req,res)=>{
 // console.log(req.params.id)
  let id=req.params.id
  userHelper.updateAddress(req.params.id,req.body).then(()=>{
    res.redirect('/viewaddress')

    
  })
})

//get login 
router.get("/login", function (req, res) {
  if (req.session.user) {
    //console.log("ssssssssssssssssssss");
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr, user: true });
    req.session.loginErr = null;
  }
});

//post login
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    // console.log(response);
    // req.session.phone = response.user.phone;
    // let user = response.user;
    if (response.status) {
      if(response.user.status){
        req.session.user = response.user;
        req.session.loggedIn=true
        res.redirect('/')
      }else
      {
        req.session.loginErr="You are blocked"
        res.redirect('/login')
      }
     
    } else {
      req.session.loginErr = "Invalid email or password";
      res.redirect("/login");
    }
  });
});

router.get("/verify", (req, res) => {
  if (req.session.user) {
  
    res.redirect('/')
  } else {
    var Number = req.session.phone;
    res.render("user/verify", { Number, er: req.session.Er_otp });
  }
});

router.post("/verify", (req, res) => {
  var Number = req.session.phone;
  console.log(Number);
  var Otp = req.body.otp;
  console.log(Otp);
  client.verify
    .services(otp.serviceSID)
    .verificationChecks.create({ to: `+91${Number}`, code: Otp})
    .then((data) => {
     // console.log(data.status);
      if (data.status == "approved") {
        //console.log(req.session.userbody);
        userHelper.doSignup(req.session.userbody).then((response)=>{
          req.session.ok=true
          res.redirect('/login')
        })
      }else
      {
        req.session.Er_otp='invalid otp'
        res.redirect('/verify')
      }
        
    })
});


router.get("/signup", (req, res) => {
  res.render("user/signup", { signUpErr: req.session.signUpErr, user: true });
  req.session.signUpErr = null;
});

router.post("/signup", (req, res) => {
  req.session.ok=false
  //console.log(req.body);
  userHelper.checkUser(req.body).then((response) => {
   // console.log("signup");
    if (response.user) {
      req.session.signUpErr = "User already existed";
      res.redirect("/signup");
    } else {
      if(req.body.username&&req.body.email&&req.body.phone&&req.body.password)
      var number=req.body.phone
      req.session.phone=req.body.phone
     req.session.userbody=req.body

      client.verify.services(otp.serviceSID).verifications.create({
      to:`+91${number}`,channel:"sms",
      }).then((data)=>{
       // console.log(data)
        console.log("line 40 data")
        res.redirect('/verify')
      })
      // userHelper.doSignup(req.body).then((response) => {
      //   res.redirect("/login");
      // });
    }
  });
});










router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// //checked using middleware only get for logged users
// router.get("/shopping-cart", verifyLogin, (req, res) => {
//   let userloged = req.session.user;
//   res.render("user/shopping-cart", { user: true, userloged });
// });





router.get('/pro',(req,res,next)=>{

   userHelper.getAllProducts().then((products)=>{
   // console.log("gfffffffffffffffffffffffffhfgff");
    //console.log(products)
    req.session.categoryproducts=products
    res.redirect('/product')
   })
 
})
// categories based products in shop
router.get('/show/:CName',async(req,res)=>{
  
  let catproducts=await userHelper.getCategoryProducts(req.params.CName)
  
    req.session.categoryproducts=catproducts
 
    res.redirect('/product')
  })
  //all prod in shop
  router.get('/showall',async(req,res)=>{
    //console.log("kkkkkkkkkkkkkk")
    let catproducts=await userHelper.getProducts()
    console.log(catproducts);
    req.session.categoryproducts=catproducts
    res.redirect('/pro')
  })

router.get("/product",async (req, res, next)=> {
  let userloged = req.session.user;
 // let address=await userHelper.getadddorders(req.session.user._id)
  let category=await userHelper.getCategoryUser()
  let products=req.session.categoryproducts
  let offer=await userHelper.getAllOffer()
 // console.log("hello");
 // userHelper.getAllProducts().then((products) =>{
   // console.log(products);
   
    if(req.session.user)//if user logged then shows header noti
    {
      
    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
     // console.log(count);
     // console.log(products)
    res.render("user/product", { products, user: true,userloged,count ,user:req.session.user,category,wcount,offer});
    })
  })
    }else{
      res.render("user/product", { products,category, user: true,offer});
    }
  })
//})





router.get("/about", function (req, res) {
  let userloged = req.session.user;
  if(userloged)
  {
    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
        res.render("user/about", { user: true, userloged ,count,wcount});
      })
    })
  }else
 // let userloged = req.session.user;
  res.render("user/about", { user: true, userloged });
});

router.get("/contact", function (req, res) {
  let userloged = req.session.user;
  if(req.session.user)
  {
    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
  
  res.render("user/contact", { user: true, userloged ,count,wcount});
  })
})

}else
{
  res.render("user/contact", { user: true, userloged});

}
})

router.get("/product-detail/:id",verifyLogin, async (req, res) => {
  let userloged = req.session.user;
  let id = req.params;

  //console.log(req.params);
  try{
    let product = await userHelper.getProductDetails(id);
    if(!product)
    {throw 'not found'
    }
    
  console.log(product);
  userHelper.getCartCount(req.session.user._id).then((count)=>{
    userHelper.getWishCount(req.session.user._id).then((wcount)=>{
  res.render("user/product-detail", { product, user: true, userloged,count,wcount });
    })
  })
  }catch(err){
    res.redirect('/oopserr')
  }
  
});
  

router.get('/wishList/:id',verifyLogin,(req,res)=>{
  //console.log("hhhhhhhh");
  
    userHelper.addToWishlist(req.params.id,req.session.user._id).then((data)=>{
    //  console.log("hai");
    console.log(data)
    res.json(data)
  })
    })


  // router.get('/place-order',verifyLogin,async(req,res)=>{
  //   //console.log("hhhhhhhh");
  //    let total=await  userHelper.getTotalamount(req.session.user._id).then(()=>{
  //     //  console.log("hai");
  //       res.render('user/order',{user:true})
  //     })
  //   })
  
 




    router.get('/place-order',verifyLogin,async(req,res)=>{
      //console.log(";;;;;;;;;;;;;;;;");
      //console.log(req.session.user._id);
      let userloged = req.session.user;
      let total=await userHelper.getTotalamount(req.session.user._id)
      let totalamt=await userHelper.getTotalOfferamount(req.session.user._id)
      let finalpriceamt=req.session.finaltotal

     
      console.log("amt reached");
      console.log(finalpriceamt);
      //console.log(total)
      //console.log("address reached");
      let address=await userHelper.getAllAddress(req.session.user._id)
     // console.log("&**********************");
     // console.log(address)
     // console.log("address not come");
      
  userHelper.getCartCount(req.session.user._id).then((count)=>{
    userHelper.getWishCount(req.session.user._id).then((wcount)=>{
      res.render('user/place-order',{user:true,total,finaltotal:req.session.finaltotal,user:req.session.user,userloged,count,wcount,address,totalamt,finalpriceamt})
     
    })
  })
})
    router.post('/place-order',async(req,res)=>{
     // console.log("@#@#@#@#");
      //console.log(req.body.userId);
      //console.log(req.body);
      let finaltotal=req.session.finaltotal
      console.log("session value");
      console.log(finaltotal)
      let products=await userHelper.getCartProductLists(req.body.userId)
    
     
      //console.log(products);
      let totalprice=await userHelper.getTotalamount(req.body.userId)
      userHelper.placeOrder(req.body,products,req.session.finaltotal).then((orderId)=>{
        req.session.orderId=orderId
        if(req.body['payment-method']==='COD'){
         
          res.json({codsuccess:true})
        }else  if(req.body['payment-method']==='Paypal'){
          userHelper.generatePaypal(orderId,totalprice).then((response)=>{
            
            response.status='Paypal'
            // console.log("OOOOOOOOOOOOOOO");
            // console.log(response)
            // console.log("OOOOOOOOOOOOOOO");

            res.json(response)
          })
        }
        else
        {
          userHelper.generateRazorpay(orderId,totalprice).then((response)=>{

            //console.log("razor pay");
            response.status="RAZORPAY"
            //console.log(response)
            res.json(response)
          })
    
      }
    })
    req.session.coupondisamt=0
    //console.log("Iam here");
      //console.log(req.body)
    })

    router.post('/verify-payment',(req,res)=>{
     // console.log(req.body);
      userHelper.verifyPayment(req.body).then(()=>{
        userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
          console.log("Payment successfull")
          res.json({status:true})
        })
      }).catch((err)=>{
        console.log(err)
        res.json({status:false,errMsg:''})
      })
    })


router.get("/wishlist", verifyLogin,async(req, res) => {

  let products=await userHelper.getWishProducts(req.session.user._id)
 // console.log("@@@@@@@@@@@@@@@@@@@@");
  //console.log(products)
  let userloged = req.session.user;
  userHelper.getCartCount(req.session.user._id).then((count)=>{
    userHelper.getWishCount(req.session.user._id).then((wcount)=>{
    // console.log(count)
    
  res.render("user/wishlist", { user: true, userloged,wcount,products,count});
})
})
})
  
router.get('/shopping/:id',verifyLogin,(req,res)=>{
 console.log("hhhhhhhh");
    userHelper.addToCart(req.params.id,req.session.user._id).then((data)=>{
      console.log("params");
      console.log(req.params.id);
    //  console.log("hai");
    console.log(data)
    res.json(data)
    })
  })

  // router.get('/shop/:id',verifyLogin,(req,res)=>{
  //   console.log("hhhhhhhh");
  //      userHelper.addToCart(req.params.id,req.session.user._id).then((data)=>{
  //        console.log("params");
  //        console.log(req.params.id);
  //      //  console.log("hai");
  //      console.log(data)
  //    res.render("user/wishlist", { user: true});
  //      })
  //    })
   


router.get('/shopping-cart/:id',verifyLogin,(req,res)=>{
//console.log("hhhhhhhh");
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    console.log(req.params.id);
  //  console.log("hai");
    res.redirect('/product')
  })
})


router.get("/shopping-cart",(req,res)=>{
  let userloged = req.session.user;
  res.render("user/shopping-cart", { user: true, userloged });
});

//  router.get('/shopping/:id/:id',verifyLogin,(req,res)=>{
//     //console.log("hhhhhhhh");
//       userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
//       //  console.log("hai");
//       res.redirect('/cart')
//       })
//     })
router.post('/apply-coupon', async(req, res)=> {
  console.log("############");
let singleuserId=req.session.user._id
console.log(singleuserId);


// userHelper.checkuserCoupon(req.body).then((response) => {
 
//    if (response.status) {
//      req.session.couponErr = "Coupon already existed";
//     //  res.redirect("/admin/add-coupon");
//    } else {
  console.log("RRRRRRRRRR");
  console.log(req.body)
  //console.log(req.session.user._id);
  console.log("EEEEEEEEEE");
  console.log(req.session.coupondetails);
  console.log("EEEEEEEEEE");
   
   userHelper.adduserCoupon(req.body,singleuserId).then((response)=>{
    console.log(response);
     if(response.status){
      response.status=true
      req.session.CoupErr="Coupon Applied"
      res.redirect('/cart')
     }
    //  }else{
    //   response.status=false
    //   req.session.CoupErr="Coupon Used"
    //   res.redirect('/cart')
    //  }
   
     })
    })
   
 


router.get('/cart',verifyLogin,async(req,res)=>{
    req.session.coupondisamt=null
  let coupon=await userHelper.getCoupons(req.session.user._id)
  let couponprice=await userHelper.getCouponprice(req.session.user._id)
  let user=await userHelper.getCartByUser(req.session.user._id)
  // console.log("user:",user);
  // console.log("coupon price : ");
  // console.log(couponprice.offer);
// let cou=await  userHelper.checkuserCoupon(req.body)
 
//     console.log("bbbbbbbbbbb");
//     console.log(cou);
if(couponprice)
{
  console.log("lam here!!!!!!!");
  req.session.coupondisamt=couponprice.offer
}

  let offer=await userHelper.getAllOffer()
  let products=await userHelper.getCartProducts(req.session.user._id)
   let coupondet=await userHelper.getAppliedCoupon(req.session.user)
 
   console.log(products);
  let totalvalue=0
  let total=0
  let offeramt=0
  let final=0
  let Cfinal=0
   let actualprice=await userHelper.getTotalamount(req.session.user._id)

 console.log("actual price");
 console.log(actualprice);
 

 let discount=0
 if(products.length>0){
  for(let i=0;i<products.length;i++){
    if(products[i].product.offer_status){
      discount=discount+products[i].product.discount
    }
  total=actualprice
  }
  final=total-discount
 }
 if(couponprice)
 {
   let discoupon=req.session.coupondisamt
  console.log(discoupon);
  Cfinal=final-req.session.coupondisamt
  req.session.finaltotal=Cfinal
  let finaltotal= req.session.finaltotal
   console.log(Cfinal);
   console.log(finaltotal);
   
 }else
 {
  console.log("pppp");
  req.session.finaltotal=final
 }


  let userloged = req.session.user;
  req.session.finalvalue=final
  console.log("finalvalue");
  console.log( req.session.finalvalue);
  userHelper.getCartCount(req.session.user._id).then((count)=>{
    userHelper.getWishCount(req.session.user._id).then((wcount)=>{
 
    res.render('user/cart',{user:true,userloged,coupondisamt:req.session.coupondisamt,products,Cfinal,count,wcount,totalvalue,coupon,user:req.session.user._id,coupondata:req.session.coupondetails,offer,offeramt,discount,totalvalue,total,final})
  })
  })
})


  router.post('/change-product-quantity',(req,res,next)=>{
   console.log(req.body)
   
    userHelper.changeProductQuantity(req.body).then(async(response)=>{
    
     response.total=await userHelper.getTotalamount(req.body.user)
    
   res.json(response)
    })
  })
 
 router.post('/remove-item',(req,res,next)=>{

  userHelper.deleteCartProduct(req.body).then((response)=>{
   
    res.json(response)
  })
 })
 router.post('/removeitem',(req,res,next)=>{

   userHelper.deleteWishProduct(req.body).then((response)=>{
   
     res.json(response)
   })
  })

  router.get('/order-success',(req,res)=>{
    let userloged = req.session.user;
    req.session.coupondisamt=0

    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
    
    res.render('user/order-success',{user:true,user:req.session.user,userloged,count,wcount})
  })
})
})
  router.get('/orders',verifyLogin,async(req,res)=>{
    let userloged = req.session.user;
    let finalpriceamt=req.session.finalvalue
  
    let address=await userHelper.getadddorders(req.session.user._id)
 
    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
    res.render('user/orders',{user:true,user:req.session.user,userloged,count,wcount,address,finalpriceamt})
  })
})
})


router.get('/changepassword',verifyLogin,(req,res)=>{
  let userloged=req.session.user
 
  if(userloged){
  
    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
    res.render('user/change-pass',{user:true,userpassword:req.session.userpassword,count,wcount,userloged})
    req.session.userpassword=false
      })
    })
  }else
  {
   res.render('user/my-profile',{user:true})
  }
})


 router.post('/changepassword',verifyLogin,(req,res)=>{
  let userloged=req.session.user
 if(userloged)
 {
  console.log("postinnnnnng");
  userHelper.changepassword(req.body,req.session.user._id).then((response)=>{
    if(response.status)
    {
      req.session.userpassword="Password successfully Changed"
    
      res.redirect('/myprofile') 
    }else
    {
      req.session.userpassword="Please enter your password and try again"
      res.redirect('/changepassword') 
    }

  })
 }else
 {
  res.render('user/my-profile',{user:true,user:req.session.user,userloged})
 }
})

  router.get('/addaddress',verifyLogin,(req,res)=>{
    let userloged=req.session.user
    userHelper.getCartCount(req.session.user._id).then((count)=>{
      userHelper.getWishCount(req.session.user._id).then((wcount)=>{
 res.render('user/add-address',{addressErr:req.session.addressErr,user:true,userloged,count,wcount})
 console.log(userloged);
 req.session.addressErr=null
    })
  })
})
  
router.post('/addaddress',verifyLogin,(req,res)=>{
  console.log('ensdff555555555555555555555555555');
  userHelper.addAddress(req.body,(id)=>{
    res.redirect("/myprofile")
  })
})


//...............................................
//search

router.get('/search',async(req,res)=>{
  console.log('66666666666666666');
  let category=await userHelper.getCategoryUser()
  res.render('user/product',{products:req.session.searchData,category,value:true,user:true})
 
})

router.post('/search',(req,res)=>{
  userHelper.getSearch(req.body.searchname).then((data)=>{

    req.session.searchData=data
    res.redirect('/search')

  })

 

  })

 

router.get('/success',async (req, res) => {
 // let userloged=req.session.user

  let totalprice=await userHelper.getTotals(req.session.orderId)
  console.log("userrr");
 console.log(req.session.orderId);
 totalprice= totalprice.totalAmount
 console.log("hhhhhhhhhhhhhhh");
  console.log(totalprice);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": totalprice
        }
    }]
  }

  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));

        res.redirect('/order-success')
    }
})
})




router.get('/cancel/:id',(req,res)=>{
  let Id=req.params.id


  userHelper.cancelOrder(Id).then((response)=>{

    res.redirect('/orders')

  })
})


router.post('/couponcart',async(req,res)=>{
  let userlogedid = req.session.user._id;

   req.session.coupondetails=req.body.coupon
    res.redirect("/cart")
  })
  // router.post('/delete-coupon',(req,res)=>{
    
  //   console.log(req.body.data);
  //   adminHelpers.deleteCoupon(req.body.data).then((response)=>{
  //     res.json(response)
  //   })
  // })
  
  // router.post('/removeCoupon', (req, res) => {
  //   console.log((req.body));
  //   adminHelpers.removeCoupon(req.body.userid).then((response) => {
  //     res.json(response)
  //   })
  // })
router.get('/cancel',(req,res)=>res.send('Cancelled'))

module.exports = router;
