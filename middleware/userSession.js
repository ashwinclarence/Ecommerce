const userSchema = require("../model/userSchema");

async function checkUserSession(req, res, next) {
    try {

        const userDetails = await userSchema.findOne({ email: req.session.user });
        if(req.session.user && userDetails && userDetails.isBlocked){
            req.session.user=""
            res.redirect('/user/login')
        }else{
            next();
        }
       
    } catch (err) {
        console.error(`Error in checkUserSession middleware ${err}`);
    }
}

module.exports = checkUserSession;
