const orderSchema = require("../../model/orderSchema");
const userSchema = require('../../model/userSchema')



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

        const orderDetails = await orderSchema.findByIdAndUpdate(orderID, { orderStatus: 'Cancelled', isCancelled: true })

        if (orderDetails.paymentMethod != 'Cash on delivery') {
            const userDetails = await userSchema.findByIdAndUpdate(req.session.user, { $inc: { wallet: orderDetails.totalPrice } })
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

module.exports = {
    order,
    cancelledOrder,
    cancelledOrderPost
}