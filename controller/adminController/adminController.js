
const mongoose = require('mongoose')
const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')
const userSchema = require('../../model/userSchema')
const orderSchema = require('../../model/orderSchema')


// render the login page for admin only if the admin's session is not present 
const admin = (req, res) => {
    res.redirect('/admin/login')
}



// render the login page for admin only if the admin's session is not present 
const login = (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/dashboard')
        } else {
            res.render('admin/login', { title: "Admin Login", alertMessage: "" })
        }
    } catch (err) {
        console.log(`Error during admin login page render ${err}`)
    }

}


// login with admin's username and password
const loginPost = (req, res) => {
    try {
        if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            req.session.admin = req.body.username;
            res.redirect('/admin/dashboard')
        } else {
            res.render('admin/login', { title: "Admin Login", alertMessage: "Invalid username or password" })
        }

    } catch (err) {
        console.log(`Error during admin login post ${err}`)
    }

}


// rendering the dashboard page
const dashboard = async (req, res) => {
    try {


        // sales report
        const orders = await orderSchema.find();

        // current date
        const currentDate = new Date();
        const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // daily report
        const dailyReport = orders.reduce((acc, ele) => {
            if (new Date(ele.createdAt) >= startOfToday) {
                return acc + ele.totalPrice;
            }
            return acc;
        }, 0);

        // weekly report
        const weeklyReport = orders.reduce((acc, ele) => {
            if (new Date(ele.createdAt) >= startOfWeek) {
                return acc + ele.totalPrice;
            }
            return acc;
        }, 0);

        // monthly report
        const monthlyReport = orders.reduce((acc, ele) => {
            if (new Date(ele.createdAt) >= startOfMonth) {
                return acc + ele.totalPrice;
            }
            return acc;
        }, 0);



        res.render('admin/dashboard', { title: "Admin Dashboard", alertMessage: req.flash('errorMessage'), dailyReport, weeklyReport, monthlyReport })


    } catch (err) {
        console.log(`Error during admin dashboard render ${err}`);
    }

}

// generate custom sales report using fetch
const generateCustomSales = async (req, res) => {
    try {
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        const orders = await orderSchema.find({ createdAt: { $gte: startDate, $lte: endDate } });

        const sale=orders.reduce((acc,ele)=>{
            return acc+ele.totalPrice
        },0)

        return res.status(200).json({ message: "Report Generated", sale });
    } catch (err) {
        console.log(`Error on generating custom sales report: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}









// logout the admin session and redirect to the login page
const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(`Error occurred while destroying the session ${err}`)
            } else {
                res.redirect('/admin/login')
            }
        })
    } catch (err) {
        console.log(`Error during admin logout ${err}`);
    }

}



module.exports = {
    login,
    admin,
    dashboard,
    loginPost,
    logout,
    generateCustomSales,

}