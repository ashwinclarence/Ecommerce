
const orderSchema = require("../../model/orderSchema");



// render the order page 
const order = async (req, res) => {
    try {

        // get the order details from order collection 
        const orderDetails = await orderSchema.aggregate([{ $unwind: "$products" }])


        res.render('admin/order', { title: "Order list", orderDetails, alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on rendering the admin order page ${err}`);
    }


}

// edit the order status
const editOrder = async (req, res) => {
    try {
        const orderID = req.params.id
        const productID = req.params.proID
        const orderStatus = parseInt(req.body.orderStatus)
        const productDeliveryStatusEnum = ['Pending', 'Shipped', 'Delivered', 'Returned'];

        const order = await orderSchema.findById(orderID)

        order.products.forEach((ele) => {
            if (ele.productID.toString() === productID) {
                ele.productStatus = productDeliveryStatusEnum[orderStatus]
            }
        })

        await order.save()



        req.flash('errorMessage', 'Order status updated')
        res.redirect('/admin/orders')

    } catch (err) {
        console.log(`Error on changing the order status ${err}`);
    }
}


module.exports = {
    order,
    editOrder,
}