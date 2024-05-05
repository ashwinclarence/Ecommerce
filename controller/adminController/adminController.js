
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









// rendering the dashboard page
const dashboard = (req, res) => {

    res.render('admin/dashboard', { title: "Admin Dashboard" })

}










// render the order page 
const order = (req, res) => {

    res.render('admin/order', { title: "Order list" })

}



// render the coupons page 
const coupons = (req, res) => {

    res.render('admin/coupons', { title: "Coupons" })

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
    order,
    coupons,
    loginPost,
    logout,

}