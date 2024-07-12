
const orderSchema = require("../../model/orderSchema");
const walletSchema = require('../../model/walletSchema')


// render the order page 
const order = async (req, res) => {
    try {
        const productsPerPage = 10;  // Number of products per page
        const currentPage = parseInt(req.query.page) || 1;  // Current page from query parameter, default to 1

        const skip = (currentPage - 1) * productsPerPage;

        const orderSearch = req.query.search;

        // get the order details from order collection (
        const orderDetails = await orderSchema.find().populate('products.productID').skip(skip).limit(productsPerPage).sort({ createdAt: -1 })

        // Count total number of products
        const totalProducts = await orderSchema.find();

        // Calculate total number of pages
        const pageNumber = Math.ceil(totalProducts.length / productsPerPage);

        // find the blocked products count
        let cancelledProducts = 0
        let deliveredProducts = 0
        let confirmedProducts = 0
        totalProducts.forEach((ele) => {
            if (ele.orderStatus === 'Delivered') {
                deliveredProducts++;
            }
            if (ele.orderStatus === 'Cancelled' || ele.orderStatus === 'Returned') {
                cancelledProducts++;
            }
            if (ele.orderStatus === 'Confirmed') {
                confirmedProducts++;
            }
        })


        res.render('admin/order', {
            title: "Order list",
            alertMessage: req.flash('errorMessage'),
            orderDetails,
            pageNumber,
            currentPage,
            totalProducts: totalProducts.length,
            deliveredProducts,
            cancelledProducts,
            confirmedProducts
        })
    } catch (err) {
        console.log(`Error on rendering the admin order page ${err}`);
    }


}

// render order page
const viewOrder = async (req, res) => {
    try {
        const orderID = req.params.orderID;

        const orderDetails = await orderSchema.findById(orderID).populate('products.productID')

        res.render('admin/orderStatus', { title: "Order status", orderDetails, alertMessage: req.flash('errorMessage') })


    } catch (err) {
        console.log(`Error on rendering the view order page in admin ${err}`);
    }
}

// edit the order status
const editOrder = async (req, res) => {
    try {
        const orderID = req.params.orderID
        const orderStatus = parseInt(req.body.orderStatus)
        const productDeliveryStatusEnum = ['Confirmed', 'Shipping', 'Delivered', 'Returned', 'Cancelled']

        const order = await orderSchema.findById(orderID)

        // change the order status 
        order.orderStatus = productDeliveryStatusEnum[orderStatus]

        // if the order status is delivered then set the delivery date
        if (order.orderStatus === "Delivered") {
            order.deliveryDate = new Date()
        }

        await order.save()



        req.flash('errorMessage', 'Order status updated')
        res.redirect('/admin/orders')

    } catch (err) {
        console.log(`Error on changing the order status ${err}`);
    }
}


// allow the return order 
const allowReturnOrder = async (req, res) => {
    try {
        const { orderID } = req.params
        // update the order details as cancelled orders
        const orderDetails = await orderSchema.findByIdAndUpdate(orderID, {
            orderStatus: "Returned",
            isCancelled: true
        });
        // if the order is other than COD then add the payment to the wallet
        if (orderDetails.paymentMethod != "Cash on delivery") {
            // check if user has a wallet before
            const wallet = await walletSchema.findOne({ userID: orderDetails.userID });

            // if the user has a wallet then update the balance
            if (wallet) {
                wallet.balance += orderDetails.totalPrice;
                wallet.orderID.push(orderDetails._id);

                // save the changes
                await wallet.save();
            } else {
                // if the user didn't have a wallet then create a new one
                const newWallet = new walletSchema({
                    userID: orderDetails.userID,
                    balance: orderDetails.totalPrice,
                    orderID: orderDetails._id,
                });

                // save the new wallet
                await newWallet.save();
            }
        }

        if (orderDetails) {
            return res.status(200).json({ success: "Order returned" })
        } else {
            return res.status(404).json({ error: "Order cannot returned" })

        }

    } catch (err) {
        console.log("Error on allowing the return order", err);
    }
}


// reject the return order 
const rejectReturnOrder = async (req, res) => {
    try {
        const rejectReason=req.body.rejectReason

        const { orderID } = req.params;

        // update the order details as cancelled orders
        const orderDetails = await orderSchema.findByIdAndUpdate(orderID, {
            orderStatus: "Delivered",
            reasonForRejection:rejectReason
        });

        if (orderDetails) {
            req.flash("errorMessage","order reject with reason sended to user")
            return res.redirect(`/admin/view-order/${orderID}`)
        } else {
            req.flash("errorMessage","unable to reject the order return please try again later")
            return res.redirect(`/admin/view-order/${orderID}`)

        }


    } catch (err) {
        console.log("Error on reject the return order", err);
    }
}

module.exports = {
    order,
    viewOrder,
    editOrder,
    allowReturnOrder,
    rejectReturnOrder
}