const orderSchema = require("../../model/orderSchema");
const userSchema = require('../../model/userSchema')
const walletSchema = require('../../model/walletSchema')


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
            req.flash('errorMessage', 'We apologize, but your product is not eligible for return at this time. If you have any questions or need further assistance, please contact our customer support team')
            res.redirect('/user/orders')
        }

    } catch (err) {
        console.log(`Error on cancelling the order POST ${err}`);
    }
}

const walletRender = async (req, res) => {
    try {

        const wallet = await userSchema.findById(req.session.user)

        const walletBalance = wallet.wallet

        const orderDetails = await orderSchema.find({ userID: req.session.user, paymentMethod: "Razor pay", orderStatus: { $in: ["Cancelled", "Returned"] } }).sort({ createdAt: -1 })

        res.render('user/wallet', { title: "wallet", alertMessage: req.flash('errorMessage'), user: req.session.user, walletBalance, orderDetails })

    } catch (err) {
        console.log(`Error on rendering the wallet page ${err}`);
    }
}

module.exports = {
    order,
    cancelledOrder,
    cancelledOrderPost,
    walletRender
}