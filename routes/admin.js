
var express = require('express');
const async = require('hbs/lib/async');
// const { response } = require('../app');
// const { response } = require('../app');
var router = express.Router();
const Swal = require('sweetalert2');



//const adminHelpers = require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');



// router.get('/index', function(req, res, next) {
  
//   res.render('admin/index');
  
// });





const verify=(req,res,next)=>{
  if(req.session.logIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}


router.get('/login',function(req, res, next) {
  
  if(req.session.logIn==true)
  {
    res.redirect('/admin')
  }
  
  res.render('admin/login');
  
});
//
adminCred ={
  email:"admin@gmail.com",
  password:"hello123"
}

router.get('/',verify,async(req, res, next)=> {
  let yearly=await userHelper.getyearlySales()
     
 console.log("ethhiiii")
 console.log(yearly);
    if(req.session.logIn){
      userHelper.getAllUser().then((users) => {
       //  console.log("vannuuuu")
        // console.log(users);
        res.render('admin/index',{users,admin:true, warn:req.session.exist,yearly} );
        req.session.exist=false
      }) 

    }else{
      res.render('admin/login',{login:true})
    }

});







router.get('/block/:id',(req,res)=>{
  console.log("qqqqqqqqqqq")
  userHelper.blockUsers(req.params.id).then((data)=>{
   // res.redirect('/admin/user-details')
   console.log(data)
    res.json({status:true})
  })
});
router.get('/unblock/:id',(req,res)=>{
  userHelper.unblockUsers(req.params.id).then((users)=>{
     res.redirect('/admin/user-details');
   
  })
});

router.get('/remove/:id',(req,res)=>{
  userHelper.removeOffer(req.params.id).then((users)=>{
     res.redirect('/admin/product-list');
   
  })
})

// router.get('/user-data',function(req,res){
//   userHelper.getAllUser().then((users)=>{
//     console.log(users)
//     res.render('admin/user-data',{admin:true})
//   })
// })

// router.get('/index',(req,res)=>{
//   res.render('admin/index')
// })
router.get('/product-cart',(req,res)=>{
  res.render('/admin/product-cart')
})

// router.get('/pr-edit',function(req,res){
//   res.render('admin/pr-edit')
// })
// router.get('/add-product',function(req,res){
//   res.render('admin/add-product')
// })


// router.get('/delete-user/:id',(req,res)=>{
//      let userId=req.params.id
  

//  userHelper.deleteUser(userId).then((response)=>{
//    res.redirect('/admin')
//    console.log(response);
//  })

// })
// router.get('/edit-user/:id',async(req,res)=>{
//   console.log(req.params.id);
//   //req.session.destroy()
// let userdetails= await adminHelpers.getUserdetails(req.params.id)
// console.log(userdetails)
//   res.render('admin/edit-user',{userdetails,admin:true})
// })

// router.post('/edit-user/:id',(req,res)=>
// {
//   if(req.body.email==""||req.body.password==""){
//     console.log("please fill the fields")
//     res.redirect('/admin')
//   }else
//   {
//   //console.log("nbnb");
//   adminHelpers.updateUser(req.params.id,req.body).then(()=>{
//     res.redirect('/admin')
//   })
// }
// })



router.post('/index', function (req,res){
 //console.log("hhh");
 if(req.body.email==adminCred.email && req.body.password == adminCred.password){
   req.session.logIn=true
       
   res.redirect('/admin')
   
 }else if(req.body.email==''||req.body.password==''){
  res.render('admin/login',{login:true,warn:"Email or Password cannot be empty"})
 }else{
  res.render('admin/login',{login:true,warn:"Invalid credentials"})
 }
 
})





router.get('/add-user',verify,(req,res)=>{
  
//console.log(userdetails)
  res.render('admin/add-user',{value:true,admin:true,exist:req.session.exist})
  req.session.exist=false
})

router.post('/add-user', (req,res)=>{
  userHelper.checkUser(req.body).then((result)=>{
    if(result.status)
    {
      req.session.exist="Email alredy existed!"
      res.redirect('/admin/add-user')
    }else{
      userHelper.doSignup(req.body).then((response)=>{
        console.log("hhhh");
       // res.redirect('/admin/user-data')
      })
      
    }
  })
  console.log("hhh");
  if(req.body.email==adminCred.email && req.body.password == adminCred.password){
    req.session.logIn=true
        
    res.redirect('/admin')
    
  }else if(req.body.email==''||req.body.password==''){
   res.render('admin/login',{login:true,warn:"Email or Password cannot be empty"})
  }else{
   res.render('admin/login',{login:true,warn:"Invalid credentials"})
  }
  
 })






 


router.get('/add-product',verify,async(req,res)=>{
  let category=await userHelper.getAllCategory()
 // console.log(category)
  res.render('admin/add-product',{category})
  //res.render('admin/add-product' )
  //console.log(req.body);
 })

  router.post('/add-product',verify,(req,res)=>{
    userHelper.addProduct(req.body,(id)=>{
      
      let image=req.files.Image
    //  console.log(id)
      image.mv('./public/product-images/'+id+'.jpg',(err)=>{
        if(!err){
          res.redirect("/admin/product-list")
       }else{
         console.log(err)
       }
      })
    })
    // console.log(req.body);
    // console.log(req.files.Image);
    // userHelper.addProduct(req.body,(result)=>{
    //   res.render("admin/add-product")
    })
router.get('/edit-product/:id',verify,async(req,res)=>{
  let product=await userHelper.getProductDetails(req.params.id)
 // console.log(product)
  let category=await userHelper.getAllCategory()
 // console.log(category)
  res.render('admin/edit-product',{product,category})
})
router.post('/edit-product/:id',verify,async(req,res)=>{

 // console.log("++++++++++++++++++++++")
 // console.log(req.body)
 // console.log("++++++++++++++++++++++")
  let id=req.params.id
  userHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/add-product')
if(req.files.Image){
  let image=req.files.Image
  image.mv('./public/product-images/'+id+'.jpg')
}
    
  })
})

router.get('/delete-product/:id',verify,(req,res)=>{
  let prodId=req.params.id
 // console.log(prodId)
  userHelper.deleteProduct(prodId).then((response)=>{
    res.redirect('/admin')

  })
})

// router.get('/product-list',function(req,res){
//   res.render('admin/product-list')
// })

router.get('/product-list',verify,function(req,res){
  userHelper.getAllProducts().then((products)=>{
   // console.log(products)
    res.render('admin/product-list',{admin:true,products})
  })
})



router.get('/category',verify,function(req,res){
  userHelper.getAllCategory().then((category)=>{
  //  console.log(category)
    res.render('admin/category',{category,admin:true})
  })
})



router.post("/signup", (req, res) => {
  req.session.ok=false
 // console.log(req.body);
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
        //console.log(data)
        console.log("line 40 data")
        res.redirect('/verify')
      })
      // userHelper.doSignup(req.body).then((response) => {
      //   res.redirect("/login");
      // });
    }
  });
});

router.get('/add-category',(req,res)=>{
  res.render('admin/add-category',{catErr:req.session.catErr, admin:true})
req.session.catErr=null
 })




 router.post('/add-category',(req,res)=>{
  userHelper.checkCategory(req.body).then((response) => {
   // console.log("category");
    if (response.status) {
      req.session.catErr = "Category already existed";
      res.redirect("/admin/add-category");
    } else {
    userHelper.addCategory(req.body,(id)=>{
     //  console.log(id)
       res.redirect("/admin/category")
    
      })
    }
    
     })
    })

    router.get('/edit-category/:id',async(req,res)=>{
      let category=await userHelper.getCategoryDetails(req.params.id)
     // console.log(category)
      res.render('admin/edit-category',{category})
    })
    router.post('/edit-category/:id',(req,res)=>{
     // console.log(req.params.id)
      let id=req.params.id
      userHelper.updateCategory(req.params.id,req.body).then(()=>{
        res.redirect('/admin/category')
    // if(req.files.Image){
    //   let image=req.files.Image
    //   image.mv('./public/product-images/'+id+'.jpg')
   // }
        
      })
    })
    
    router.get('/delete-category/:id',(req,res)=>{
      let catId=req.params.id
     // console.log(catId)
      userHelper.deleteCategory(catId).then((response)=>{
        res.redirect('/admin/category')
    
      })
    })



router.get('/user-details',verify,function(req,res,next){
  userHelper.getAllUser().then((users)=>{
   // console.log(users)
    res.render('admin/user-details',{admin:true,users})
  })
})
router.post('/user-details',(req,res)=>{
  userHelper.addUser(req.body,(id)=>{
    res.redirect('/admin/user-details')
  })
})


router.get('/add-banner',(req,res)=>{
  res.render('admin/add-banner',{admin:true})
  
  })


router.post('/add-banner',(req,res)=>{
  userHelper.addBanner(req.body,(id)=>{
   // console.log("okkkk");
      if(req.files){
        let image=req.files.Image
       // console.log(id)
        image.mv('./public/banner-images/'+id+'.jpg',(err)=>{
          if(!err){
            console.log("kkkkkkkkkkkk")
             res.redirect('/admin')
         }else{
           console.log(err)
         }
        })
      }
    })
  })

router.get('/add-banner',(req,res)=>{
  res.render('admin/add-banner',{admin:true})
  
  })


router.post('/add-banner',(req,res)=>{
  userHelper.addBanner(req.body,(id)=>{
   // console.log("okkkk");
      if(req.files){
        let image=req.files.Image
       // console.log(id)
        image.mv('./public/banner-images/'+id+'.jpg',(err)=>{
          if(!err){
            console.log("kkkkkkkkkkkk")
             res.redirect('/admin')
         }else{
           console.log(err)
         }
        })
      }
    })
  })






router.get('/order-list',async(req,res)=>{

 // console.log("products here")
  //let orders=await userHelper.getAdminOrderslists(req.body)
 // console.log(orders);
  userHelper.getAdminOrderslists().then((orders)=>{
   // console.log("rrrrrrrrrrrrr");
   // userHelper.getAllUsers().then((user)=>{

    //console.log(orders);
    res.render('admin/view-order',{orders,admin:true})
  })
})

// router.get('/cancel/:id',(req,res)=>{
//   let Id=req.params.id
//  // console.log(prodId)
//  //let ord=await userHelper.getOrderDetails(req.params.id)

//   userHelper.cancelOrder(Id).then((response)=>{

//     res.redirect('admin/order-list')
//   })
// })

router.get('/cancel/:id',(req,res)=>{
  console.log("qqqqqqqqqqq")
  let Id=req.params.id
  userHelper.cancelOrderAdmin(Id).then((response)=>{
   // res.redirect('/admin/user-details')
   console.log(Id)
    res.json({status:true})
  })
})


router.get('/shipped/:id',(req,res)=>{
  console.log("6666666")
  let Id=req.params.id
  userHelper.shipOrderAdmin(Id).then((response)=>{
   // res.redirect('/admin/user-details')
   console.log(Id)
    res.json({status:true})
  })
})
router.get('/deliver/:id',(req,res)=>{
  console.log("6666666")
  let Id=req.params.id
  userHelper.deliverOrderAdmin(Id).then((response)=>{
   // res.redirect('/admin/user-details')
   console.log(Id)
    res.json({status:true})
  })
})
router.get('/add-offer',(req,res)=>{
  res.render('admin/add-offer',{offErr:req.session.offErr, admin:true})
req.session.offErr=null
 })
 router.post('/add-offer',(req,res)=>{
  userHelper.checkOffer(req.body).then((response) => {
   // console.log("category");
    if (response.status) {
      req.session.offErr = "Offer already existed";
      res.redirect("/admin/add-offer");
    } else {
    userHelper.addoffer(req.body,(id)=>{
     //  console.log(id)
       res.redirect("/admin/category")
    
      })
    }
    
     })
    })



router.get('/add-coupon',(req,res)=>{
  res.render('admin/coupon',{couponErr:req.session.couponErr, admin:true})
req.session.couponErr=null
 })



 router.post('/add-coupon',(req,res)=>{
  userHelper.checkCoupon(req.body).then((response) => {
   // console.log("category");
    if (response.status) {
      req.session.couponErr = "Coupon already existed";
      res.redirect("/admin/add-coupon");
    } else {
    userHelper.addCoupon(req.body,(id)=>{
     // console.log(id)
       res.redirect("/admin/add-coupon")
    
      })
    }
    
     })
    })

    router.get('/view-coupon',function(req,res){
      userHelper.getAllCoupon().then((coupon)=>{
       //console.log(coupon);
        res.render('admin/view-coupon',{coupon,admin:true})
      })
    })
    

    // router.get('/delete-coupon/:id',(req,res)=>{
    //   let couponId=req.params.id
    // // console.log(couponId)
    //   userHelper.deleteCoupon(couponId).then((response)=>{
    //     res.redirect('/admin/view-coupon')
    
    //   })
    // })

    router.get('/add-offerproduct/:id',async(req,res)=>{
      let product=await userHelper.getProductDetails(req.params.id)
     console.log(product)
      let offer=await userHelper.getAllOffer()
    // console.log("gggggg");
     console.log(offer)
    
    // console.log("lllllll");
    // console.log(offeramt);
      res.render('admin/add-offerproduct',{product,offer})
    })
    router.post('/add-offerproduct/:id',async(req,res)=>{
    
     console.log("++++++++++++++++++++++")
      console.log(req.body)
     console.log("++++++++++++++++++++++")
      let id=req.params.id
      console.log(id);
      //let offeramt=await userHelper.getOfferdetails(req.body.OName)
      console.log(".......");
     // console.log(offeramt);
      //req.session.amt=req.body.offeramt
     // console.log("......."+amt);
      userHelper.applyProductoffer(req.params.id,req.body).then(()=>{
        console.log("helloo");
        res.redirect('/admin/product-list')
  
        
      })
    })
    
    // router.get('/delete-product/:id',(req,res)=>{
    //   let prodId=req.params.id
    //  // console.log(prodId)
    //   userHelper.deleteProduct(prodId).then((response)=>{
    //     res.redirect('/admin')
    
    //   })
    // })


    router.get('/report',async(req,res)=>{
    // let orders= userHelper.getAdminOrderslists()
      let dailysale=await userHelper.getDailySales()
      let monthly=await userHelper.getMonthlySales()
      let yearly=await userHelper.getyearlySales()
     
      //console.log(dailysale);
     // console.log(monthly);
      //console.log(yearly);
      res.render('admin/report',{ admin:true,dailysale,monthly,yearly})
    
     })
    
    //  router.get("/logoutAdmin", (req, res) => {
    //  // console.log("hello");
    //   req.session.destroy();
    //   res.redirect("/admin/login");
    // });


    router.get('/logoutAdmin',(req,res)=>{
     // console.log(req.body);
      req.session.logIn=false
    
      res.redirect('/admin/login')
    })
    
    
module.exports = router;
