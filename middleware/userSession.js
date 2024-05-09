const userSchema = require("../model/userSchema");

async function checkUserSession(req, res, next) {
    try {
        if (!req.session.user) {
            // User is not logged in, redirect to login
            return res.redirect('/user/login');
        }

        const userDetails = await userSchema.findOne({ email: req.session.user });

        if (!userDetails) {
            // User details not found, redirect to login
            return res.redirect('/user/login');
        }

        if (userDetails.isBlocked) {

            // destroy the session if the user si blocked
            req.session.destroy()
            // User is blocked by admin, redirect to login
            return res.redirect('/user/login');
        }

        // User is logged in and not blocked, proceed to next middleware
        next();

    } catch (err) {
        // Handle any errors
        console.error(`Error in checkUserSession middleware ${err}`);
    }
}

module.exports = checkUserSession;
