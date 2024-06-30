const userSchema = require("../model/userSchema");



// if user is logged. at the if admin block the user then the user need to redirect to login page 
async function checkUserBlocked(req, res, next) {
    try {

        // if user is logged in. check whether that user is blocked or not. if blocked then redirect to login page else move to next route
        if(req.session.user){
            // get the user details from user collection who is logged in
            const userDetails = await userSchema.findById(req.session.user);
            if(userDetails && !userDetails.isBlocked){
                next()
            }else{
                req.session.user=""
                res.redirect('/login')
                // if not blocked then moved to next route
            }
        }else{
            // if user is not logged-in. still the user is allowed to move to the home page and product page.
            next()
        }

    } catch (err) {
        console.error(`Error in checkUserBlocked middleware ${err}`);
    }
}

module.exports = checkUserBlocked;
