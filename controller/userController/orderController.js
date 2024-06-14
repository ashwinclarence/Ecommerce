const orderSchema = require("../../model/orderSchema");
const userSchema = require('../../model/userSchema')
const walletSchema = require('../../model/walletSchema')
const reviewSchema = require('../../model/reviewSchema')
const mongoose = require('mongoose');
const productSchema = require("../../model/productSchema");
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

const addReview = async (req, res) => {
    try {
        const productID = req.params.productID;
        const rating = parseInt(req.body.rating);
        const reviewFeedback = req.body.reviewFeedback;

        // Check if rating is a valid number
        if (isNaN(rating)) {
            return res.status(400).json({ error: "Invalid rating provided" });

        }
        const product = await productSchema.findById(productID)
        const productObjectId = product._id

        
        // Find existing review for the product
        const review = await reviewSchema.findOne({ productID: productObjectId });

        if (review) {
            // Check if user already reviewed the product
            let userReviewed = false;
            for (let i = 0; i < review.reviews.length; i++) {
                if (review.reviews[i].userID === req.session.user) {
                    userReviewed = true;
                    review.reviews[i].description = reviewFeedback;
                    review.reviews[i].star = rating;
                    break;
                }
            }

            // If user hasn't reviewed, add a new review
            if (!userReviewed) {
                review.reviews.push({ userID: req.session.user, description: reviewFeedback, star: rating });
            }

            // Save the updated review
            await review.save();

            return res.status(200).json({ success: "Review updated" });
        } else {
            // If no review exists, create a new one
            const newReview = new reviewSchema({
                productID: productObjectId,
                reviews: [{ userID: req.session.user, description: reviewFeedback, star: rating }]
            });

            // Save the new review
            await newReview.save();

            return res.status(200).json({ success: "Review added" });
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

        // if wallet is there then show the valet amount
        if (wallet) {
            walletBalance = wallet.balance
        }
        const orderDetails = await orderSchema.find({ userID: req.session.user, paymentMethod: { $in: ["Razor pay", 'Wallet'] }, orderStatus: { $in: ["Cancelled", "Returned"] } }).sort({ createdAt: -1 })


        res.render('user/wallet', { title: "wallet", alertMessage: req.flash('errorMessage'), user: req.session.user, walletBalance, orderDetails })

    } catch (err) {
        console.log(`Error on rendering the wallet page ${err}`);
    }
}

module.exports = {
    order,
    cancelledOrder,
    cancelledOrderPost,
    returnOrderPost,
    addReview,
    walletRender,
}