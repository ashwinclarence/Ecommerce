
const mongoose = require('mongoose')
const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')
const userSchema = require('../../model/userSchema')
const orderSchema = require('../../model/orderSchema')
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const path = require('path')

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

        // get the order details from order collection (
        const orderDetails = await orderSchema.find().populate('products.productID').sort({ createdAt: -1 })

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



        res.render('admin/dashboard', { title: "Admin Dashboard", alertMessage: req.flash('errorMessage'), dailyReport, weeklyReport, monthlyReport, orderDetails })


    } catch (err) {
        console.log(`Error during admin dashboard render ${err}`);
    }

}

// generate custom sales report using fetch
const generateCustomSales = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Validate start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end time to the end of the day

        // Fetch orders within the specified date range
        const orders = await orderSchema.find({ createdAt: { $gte: start, $lte: end } });

        // Calculate total sales
        const sale = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Send response with the calculated sales
        return res.status(200).json({ message: "Report Generated", sale });
    } catch (err) {
        console.error(`Error on generating custom sales report: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};



const downloadPdfReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Validate start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end time to the end of the day

        // Get the order details from order collection
        const orderDetails = await orderSchema.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productID').sort({ createdAt: -1 });
        console.log("🚀 ~ file: adminController.js:147 ~ downloadPdfReport ~ orderDetails:", orderDetails);

        // Initialize PDF document
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.pdf`);

        // Pipe PDF document to response
        doc.pipe(res);

        // Add title and date range
        doc.fontSize(18).text('Sales Report', { align: 'center' });
        doc.fontSize(12).text(`From ${startDate} to ${endDate}`, { align: 'center', marginBottom: 20 });

        doc.moveDown();

        // Add summary
        const totalOrders = orderDetails.length;
        const totalProducts = orderDetails.reduce((sum, order) => sum + order.products.reduce((sum, product) => sum + product.quantity, 0), 0);
        const totalRevenue = orderDetails.reduce((sum, order) => sum + order.products.reduce((sum, product) => sum + product.quantity * product.price, 0), 0);

        doc.fontSize(12).text(`Total Orders: ${totalOrders}`);
        doc.fontSize(12).text(`Total Products Sold: ${totalProducts}`);
        doc.fontSize(12).text(`Total Revenue: $${totalRevenue.toFixed(2)}`);

        doc.moveDown();

        // Define table columns
        const tableHeaders = ['OrderID', 'Date', 'Payment Mode', 'Status', 'Total'];

        // Draw table header
        doc.fontSize(10).font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
            doc.text(header, 50 + i * 80, doc.y, { width: 80, align: 'left' });
        });
        doc.moveDown();

        // Draw table rows
        doc.fontSize(10).font('Helvetica');
        orderDetails.forEach(order => {
            const orderID = order._id.toString();
            const date = order.createdAt.toISOString().split('T')[0];
            const paymentMode = order.paymentMethod; 
            const status = order.orderStatus;
            const total = order.totalPrice;

            const row = [orderID, date, paymentMode, status, `Rs${total}`];

            row.forEach((cell, i) => {
                doc.text(cell, 50 + i * 80, doc.y, { width: 80, align: 'left' });
            });
            doc.moveDown();
        });

        // Finalize the PDF and end the document
        doc.end();

    } catch (err) {
        console.error(`Error on downloading PDF sales report: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




// download the excel report
const downloadExcelReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

    } catch (err) {
        console.log(`Error on downloading excel sales report fetch ${err}`);
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
    downloadPdfReport,
    downloadExcelReport

}