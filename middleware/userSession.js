const userSchema = require("../model/userSchema")


async function  checkUserSession (req,res,next){

    // if the user is in the session and he is not blocked by the admin then next is called else redirect to login

    const userDetails=await userSchema.findOne({email:req.session.user})

    if(req.session.user && userDetails.isBlocked===false){
        next()
    }else{
        res.redirect('/user/login')
    }
}


module.exports=checkUserSession