const userSchema = require("../model/userSchema")


 function  checkUserSession (req,res,next){


    if(req.session.user){
        next()
    }else{
        res.redirect('/user/login')
    }
}


module.exports=checkUserSession