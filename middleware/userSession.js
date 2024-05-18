const userSchema = require("../model/userSchema");


// this function is to check whether user is logged in and the user session is available or not
async function checkUserSession(req, res, next) {
    try {
        if (req.session.user) {
            // get the user details from user collection who has the session 
            const userDetails = await userSchema.findById(req.session.user);

            // if the logged user is blocked then cancel the session and redirect to login
            if (userDetails && !userDetails.isBlocked) {
                next();
            } else {
                req.session.user = ""
                res.redirect('/user/login')
            }
        } else {
            // if user does not exist then redirect to login
            res.redirect('/user/login')
        }


    } catch (err) {
        console.error(`Error in checkUserSession middleware ${err}`);
    }
}

module.exports = checkUserSession;
