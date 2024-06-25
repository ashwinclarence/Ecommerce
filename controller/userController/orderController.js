const orderSchema = require("../../model/orderSchema");
const userSchema = require('../../model/userSchema')
const walletSchema = require('../../model/walletSchema')
const reviewSchema = require('../../model/reviewSchema')
const mongoose = require('mongoose');
const productSchema = require("../../model/productSchema");
const PDFDocument = require("pdfkit-table");
const fs = require('fs');
const path = require('path')







// order detail page render
const order = async (req, res) => {
    try {

        // search order
        const orderSearch = req.query.userSearch || '';


        let orderDetails = await orderSchema.find({ userID: req.session.user, isCancelled: false }).populate('products.productID').sort({ createdAt: -1 })


        // search for specific order
        // if (orderSearch != '') {
        //     orderDetails = orderDetails.filter((ele) => {
        //         return ele.products.productName.match(new RegExp(orderSearch, 'i'));
        //     });
        // }


        res.render('user/orders', { title: "Order", user: req.session.user, orderDetails, alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error rendering the order page ${err}`);
    }
}



// render the cancelled order page
const cancelledOrder = async (req, res) => {
    try {
        // search order
        const orderSearch = req.query.userSearch || '';


        let orderDetails = await orderSchema.find({ userID: req.session.user, isCancelled: true }).populate('products.productID').sort({ createdAt: -1 })

        // // search for specific order
        // if (orderSearch != '') {
        //     orderDetails = orderDetails.filter((ele) => {
        //         console.log(ele);
        //         return ele.products.productName.match(new RegExp(orderSearch, 'i'));
        //     });
        // }



        res.render('user/cancelledOrder', { title: "Cancelled Orders", orderDetails, user: req.session.user, alertMessage: req.flash('errorMessage') })

    } catch (err) {
        console.log(`Error rendering the cancelled order page ${err}`);
    }
}


// cancel the order based on the id in POST route
const cancelledOrderPost = async (req, res) => {
    try {
        const orderID = req.params.orderID;

        // update the order details as cancelled orders
        const orderDetails = await orderSchema.findByIdAndUpdate(orderID, { orderStatus: 'Cancelled', isCancelled: true })


        // if the order is other than COD then add the payment to the wallet
        if (orderDetails.paymentMethod != 'Cash on delivery') {
            // check if user has a wallet before
            const wallet = await walletSchema.findOne({ userID: req.session.user })

            // if the user has a wallet then update the balance 
            if (wallet) {
                wallet.balance += orderDetails.totalPrice
                wallet.orderID.push(orderDetails._id)

                // save the changes 
                await wallet.save()
            } else {
                // if the user didn't have a wallet then create a new one
                const newWallet = new walletSchema({
                    userID: req.session.user,
                    balance: orderDetails.totalPrice,
                    orderID: orderDetails._id,
                })

                // save the new wallet
                await newWallet.save()
            }
            // const userDetails = await userSchema.findByIdAndUpdate(req.session.user, { $inc: { wallet: orderDetails.totalPrice } })
        }

        if (orderDetails) {
            req.flash('errorMessage', 'Your order has been successfully cancelled. If you need any assistance, please contact our customer support team. Thank you.')
            res.redirect('/user/cancelled-orders')
        } else {
            req.flash('errorMessage', 'We apologize, but your product is not eligible for cancel at this time. If you have any questions or need further assistance, please contact our customer support team')
            res.redirect('/user/orders')
        }

    } catch (err) {
        console.log(`Error on cancelling the order POST ${err}`);
    }
}


// return the order using POST
const returnOrderPost = async (req, res) => {
    try {
        const orderID = req.params.orderID;

        // update the order details as cancelled orders
        const orderDetails = await orderSchema.findByIdAndUpdate(orderID, { orderStatus: 'Returned', isCancelled: true })


        // if the order is other than COD then add the payment to the wallet
        if (orderDetails.paymentMethod != 'Cash on delivery') {
            // check if user has a wallet before
            const wallet = await walletSchema.findOne({ userID: req.session.user })

            // if the user has a wallet then update the balance 
            if (wallet) {
                wallet.balance += orderDetails.totalPrice
                wallet.orderID.push(orderDetails._id)

                // save the changes 
                await wallet.save()
            } else {
                // if the user didn't have a wallet then create a new one
                const newWallet = new walletSchema({
                    userID: req.session.user,
                    balance: orderDetails.totalPrice,
                    orderID: orderDetails._id,
                })

                // save the new wallet
                await newWallet.save()
            }
            // const userDetails = await userSchema.findByIdAndUpdate(req.session.user, { $inc: { wallet: orderDetails.totalPrice } })
        }

        if (orderDetails) {
            req.flash('errorMessage', 'Your order has been successfully return. If you need any assistance, please contact our customer support team. Thank you.')
            res.redirect('/user/cancelled-orders')
        } else {
            req.flash('errorMessage', 'We apologize, but your product is not eligible for return at this time. If you have any questions or need further assistance, please contact our customer support team')
            res.redirect('/user/orders')
        }
    } catch (err) {
        console.log(`Error on returning the order POST ${err}`);
    }
}


// add review 
const addReview = async (req, res) => {
    try {
        const productID = req.params.productID;
        const rating = parseInt(req.body.rating);
        const reviewFeedback = req.body.reviewFeedback;

        // Check if rating is a valid number
        if (isNaN(rating)) {
            return res.status(400).json({ error: "Invalid rating provided" });
        }

        // Fetch the product
        const product = await productSchema.findById(productID);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const productObjectId = product._id;

        // Find existing review for the product
        let review = await reviewSchema.findOne({ productID: productObjectId });

        if (review) {
            // Check if user already reviewed the product
            let userReviewed = false;

            for (let i = 0; i < review.reviews.length; i++) {
                if (review.reviews[i].userID === req.session.user) {
                    userReviewed = true;
                    // Update existing review
                    review.reviews[i].description = reviewFeedback;
                    review.reviews[i].star = rating;
                    break;
                }
            }

            // If user hasn't reviewed, add a new review
            if (!userReviewed) {
                review.reviews.push({ userID: req.session.user, description: reviewFeedback, star: rating });
            }

            // Calculate average rating
            let totalRating = 0;
            for (let i = 0; i < review.reviews.length; i++) {
                totalRating += review.reviews[i].star;
            }
            review.rating = totalRating / review.reviews.length;

            // Save the updated review
            await review.save();

            return res.status(200).json({ success: "Review updated", averageRating: review.rating });
        } else {
            // If no review exists, create a new one
            const newReview = new reviewSchema({
                productID: productObjectId,
                reviews: [{ userID: req.session.user, description: reviewFeedback, star: rating }],
                rating: rating  // Initial rating for the new review
            });

            // Save the new review
            await newReview.save();

            return res.status(200).json({ success: "Review added", averageRating: newReview.rating });
        }
    } catch (err) {
        console.error(`Error on adding review via fetch post: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// wallet render
const walletRender = async (req, res) => {
    try {

        const wallet = await walletSchema.findOne({ userID: req.session.user })
        let walletBalance = 0

        // if wallet is there then show the wallet amount
        if (wallet) {
            walletBalance = wallet.balance
        }
        // const orderDetails = await orderSchema.find({ userID: req.session.user, paymentMethod: { $in: ["Razor pay", 'Wallet'] }, orderStatus: { $in: ["Cancelled", "Returned"] } }).sort({ createdAt: -1 })
        const orderDetails = await orderSchema.find({ userID: req.session.user }).sort({ createdAt: -1 })


        // get the order details of the order purchased using razor pay or wallet which is cancelled or returned
        const walletOrderDetails = orderDetails.filter((ele) => {
            if (ele.paymentMethod === "Razor pay" || ele.paymentMethod === "Wallet") {
                if (ele.orderStatus === "Cancelled" || ele.orderStatus === 'Returned') {
                    return ele
                }
            }
        })
        // get the order details which the payment method is wallet
        const walletPurchaseOrderDetails = orderDetails.filter((ele) => {
            if (ele.paymentMethod === 'Wallet') {
                return ele
            }
        })
        const walletOrderTransactions = walletOrderDetails.concat(walletPurchaseOrderDetails)

        walletOrderTransactions.sort((a, b) => b.createdAt - a.createdAt)

        res.render('user/wallet', { title: "wallet", alertMessage: req.flash('errorMessage'), user: req.session.user, walletBalance, orderDetails: walletOrderTransactions })

    } catch (err) {
        console.log(`Error on rendering the wallet page ${err}`);
    }
}


// download the invoice of the order
const downloadInvoice = async (req, res) => {
    try {
        const orderID = req.params.orderID;

        // Get the order details from order collection
        const orderDetails = await orderSchema.findById(orderID).populate('products.productID');

        const doc = new PDFDocument();
        const filename = `Cleat Craft Invoice ${Date.now()}.pdf`;

        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Add header aligned to center 
        doc.font("Helvetica-Bold").fontSize(36).text("Cleat Craft", { align: "center", margin: 10 });
        doc.font("Helvetica-Bold").fillColor("grey").fontSize(8).text("Empowering your game with elite football footwear", { align: "center", margin: 10 });
        doc.moveDown();

        doc.fontSize(10).fillColor("blue").text(`Invoice #${orderID}`);
        doc.moveDown();
        doc.moveDown();

        // Add total sales report
        doc.fillColor("black").text(`Total products: ${orderDetails.products.length}`);
        doc.fillColor("black").text(`Shipping Charge: ${orderDetails.totalPrice<500?"RS 50":"Free"}`);
        doc.fontSize(10).fillColor("red").text(`Total Amount: Rs ${orderDetails.totalPrice.toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(10).fillColor("black").text(`Payment method: ${orderDetails.paymentMethod}`);
        doc.text(`Order Date: ${orderDetails.createdAt.toDateString()}`);
        doc.moveDown();
        doc.moveDown();

        // Add address details of the company
        doc.fontSize(10).fillColor("black").text(`Address: Trivandrum, Shangumugham`);
        doc.text(`Pincode: 789589`);
        doc.text(`Phone: 987 121 120`);
        doc.moveDown();
        doc.moveDown();

        doc.fontSize(12).text(`Invoice.`, { align: "center", margin: 10 });
        doc.moveDown();

        const tableData = {
            headers: [
                "Product Name",
                "Quantity",
                "Price",
                "Discount",
                "Total"
            ],
            rows: orderDetails.products.map((product) => {
                return [
                    product?.productName,
                    product?.quantity,
                    `Rs ${product?.price}`,
                    `${product?.discount} %`,
                    `Rs ${(product.price * (1 - product.discount / 100) * product.quantity).toFixed(2)}`
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


        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(12).text(`Thank You.`, { align: "center", margin: 10 });
        doc.moveDown();


        // Finalize the PDF document
        doc.end();

    } catch (err) {
        console.log(`Error on downloading the invoice pdf ${err}`);
        res.status(500).send('Error generating invoice');
    }
};


// remove the order in which order status is pending using fetch
const removePendingOrder=async (req,res)=>{
    try {
        const orderID=req.params.orderID;

        if(!orderID){
            return res.status(404).json({error:"Cannot find the order ID"})
        }

        const removedOrder=await orderSchema.findByIdAndDelete(orderID)

        if(!removedOrder){
            return res.status(404).json({error:"Order remove the order please try again later"})
        }

        return res.status(200).json({success:"Order removed successfully"})
        
    } catch (err) {
        console.log(`Error on removing the pending order ${err}`);
    }
}


module.exports = {
    order,
    cancelledOrder,
    cancelledOrderPost,
    returnOrderPost,
    addReview,
    walletRender,
    downloadInvoice,
    removePendingOrder
}