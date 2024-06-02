const orderSchema = require("../../model/orderSchema");




// order detail page render
const order = async (req, res) => {
    try {

        // search order
        const orderSearch = req.query.userSearch || '';


        // get the order details from order collection separate each products from the order using unwind and sort based on the order of purchase
        let orderDetails = await orderSchema.aggregate([{ $match: { userID: req.session.user } }, { $unwind: "$products" }, { $sort: { createdAt: -1 } }])


        // search for specific order
        if (orderSearch != '') {
            orderDetails = orderDetails.filter((ele) => {
                return ele.products.productName.match(new RegExp(orderSearch, 'i'));
            });
        }
        

        res.render('user/orders', { title: "Order", user: req.session.user, orderDetails, alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error rendering the order page ${err}`);
    }
}



// render the cancelled order page
const cancelledOrder = (req, res) => {
    try {


        res.render('user/cancelledOrder', { title: "Cancelled Orders", user: req.session.user, alertMessage: req.flash('errorMessage') })

    } catch (err) {
        console.log(`Error rendering the cancelled order page ${err}`);
    }
}

module.exports = {
    order,
    cancelledOrder
}