const userSchema = require('../../model/userSchema')
const mongoose = require('mongoose')



// render the login page for admin only if the admin's session is not present 
const login = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin/dashboard')
    } else {
        res.render('admin/login', { title: "Admin Login", alertMessage: "" })
    }
}


// login with admin's username and password
const loginPost = (req, res) => {
    if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.admin = req.body.username;
        res.redirect('/admin/dashboard')
    } else {
        res.render('admin/login', { title: "Admin Login", alertMessage: "Invalid username or password" })
    }
}


// render the users page with search using regex
const users = async (req, res) => {
    if (req.session.admin) {
        // because of http get request req.query is used instead of req.body because in get request the data is passed through the url with name of the inputBox
        const userSearch = req.query.userSearch || '';
        const users = await userSchema.find({ name: { $regex: userSearch, $options: 'i' } })
        res.render('admin/user', { title: "users list", users })
    } else {
        res.redirect('/admin/login')
    }
}

const blockUser = async (req, res) => {
    try {
        // user id from the id field in admin/block-user/:id.
        const blockUserID = req.params.id;

        // using the user id change the isBlocked field in user collection
        const blockUserResult = await userSchema.findByIdAndUpdate(blockUserID, { isBlocked: true })

        res.redirect('/admin/user')

    } catch (err) {
        console.log(`Error during blocking the user ${err}`)
    }


}
const unBlockUser = async (req, res) => {
    try {
        // user id from the id field in admin/block-user/:id.
        const unBlockUserID = req.params.id;

        // using the user id change the isBlocked field in user collection
        const unBlockUserResult = await userSchema.findByIdAndUpdate(unBlockUserID, { isBlocked: false })


        res.redirect('/admin/user')

    } catch (err) {
        console.log(`Error during unblocking the user ${err}`)
    }
}







// rendering the dashboard page
const dashboard = (req, res) => {
    if (req.session.admin) {
        res.render('admin/dashboard', { title: "Admin Dashboard" })
    } else {
        res.redirect('/admin/login')
    }
}





// render the product page
const products = (req, res) => {
    if (req.session.admin) {
        res.render('admin/products', { title: "Product list" })
    } else {
        res.redirect('/admin/login')
    }
}






// render the order page 
const order = (req, res) => {
    if (req.session.admin) {
        res.render('admin/order', { title: "Order list" })
    } else {
        res.redirect('/admin/login')
    }
}



// render the coupons page 
const coupons = (req, res) => {
    if (req.session.admin) {
        res.render('admin/coupons', { title: "Coupons" })
    } else {
        res.redirect('/admin/login')
    }
}



// logout the admin session and redirect to the login page
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(`Error occurred while destroying the session ${err}`)
        } else {
            res.redirect('/admin/login')
        }
    })
}



module.exports = {
    login,
    dashboard,
    products,
    users,
    order,
    coupons,
    loginPost,
    logout,
    blockUser,
    unBlockUser
}