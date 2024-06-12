
const mongoose = require('mongoose')
const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')
const userSchema = require('../../model/userSchema')
const orderSchema = require('../../model/orderSchema')
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const path = require('path')
const ExcelJS = require('exceljs');


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

        const doc = new PDFDocument();
        const filename = `Cleat Craft Sales Report ${Date.now()}.pdf`;

        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Add header aligned to center 
        doc.font("Helvetica-Bold").fontSize(36).text("Cleat Craft", { align: "center", margin: 10 });
        doc.font("Helvetica-Bold").fillColor("grey").fontSize(8).text("Empowering your game with elite football footwear", { align: "center", margin: 10 });
        doc.moveDown();

        // Add logo to the left side
        // doc.image('public/img/somePlant.jpeg', {
        //     width: 100,
        //     x: 410, // Adjust for desired left margin
        //     y: 80 // Adjust for vertical position
        // });

        doc.moveDown();

        // Add address details of the company
        doc.fontSize(10).fillColor("black").text(`Address: Trivandrum, Shangumugham`);
        doc.text(`Pincode: 789589`);
        doc.text(`Phone: 987 121 120`);

        doc.moveDown();

        const totalSale = orderDetails.reduce((acc, sum) => acc + sum.totalPrice, 0)
        const totalOrders = orderDetails.length

        // Add total sales report
        doc.text(`Total Orders : ${totalOrders}`);
        doc.fontSize(10).fillColor("red").text(`Total Sales : Rs ${totalSale}`);

        // Move to the next line after the details
        doc.moveDown();

        doc.moveDown(); // Move down after the title
        doc.font("Helvetica-Bold").fillColor("black").fontSize(14).text(`Sales Report`, { align: "center", margin: 10 });
        doc.fontSize(12).text(`From ${startDate} To ${endDate}`, { align: "center", margin: 10 });

        doc.moveDown(); // Move down after the title

        const tableData = {
            headers: [
                "Order ID",
                "Address",
                "Quantity",
                "order Status",
                "Total"
            ],
            rows: orderDetails.map((order) => {
                return [
                    order?._id,
                    order.address?.homeAddress + "\n " + order.address?.areaAddress + "\n " + "Pincode :" + order.address?.pincode,
                    order?.totalQuantity,
                    order?.orderStatus,
                    'Rs ' + order?.totalPrice,
                ]
            }),
        };

        // Customize the appearance of the table
        await doc.table(tableData, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
            hLineColor: '#b2b2b2', // Horizontal line color
            vLineColor: '#b2b2b2', // Vertical line color
            textMargin: 2, // Margin between text and cell border
        });

        // Finalize the PDF document
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

        // Validate start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end time to the end of the day

        // Get the order details from order collection
        const orderDetails = await orderSchema.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productID').sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");

        // Add data to the worksheet
        worksheet.columns = [
            { header: "Reference ID", key: "orderId", width: 15 },
            { header: "Product", key: "productName", width: 20 },
            { header: "Price", key: "price", width: 15 },
            { header: "Quantity", key: "quantity", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Address", key: "address", width: 30 },
            { header: "Pincode", key: "pin", width: 15 },
            { header: "Order Date", key: "orderDate", width: 18 },
        ];

        

        for (const order of orderDetails) {
            const orderId = order._id;
            const orderDate = order.createdAt;
            const address = order.address?.homeAddress + ', ' + order.address?.areaAddress
            const pin = order.address.pincode;
            const status = order.orderStatus;

            for (const item of order.products) {
                worksheet.addRow({
                    orderId,
                    status,
                    orderDate,
                    address,
                    pin,
                    productName: item.productName,
                    price: item.price-item.discount,
                    quantity: item.quantity
                });
            }
        }

        // Generate the Excel file and send it as a response
        workbook.xlsx.writeBuffer().then((buffer) => {
            const excelBuffer = Buffer.from(buffer);
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", "attachment; filename=excel.xlsx");
            res.send(excelBuffer);
        });

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