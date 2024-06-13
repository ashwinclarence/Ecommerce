
const orderSchema = require("../../model/orderSchema");



// render the order page 
const order = async (req, res) => {
    try {

        const orderSearch=req.query.search;

        // get the order details from order collection (
        const orderDetails = await orderSchema.find().populate('products.productID').sort({createdAt:-1})

     
        res.render('admin/order', { title: "Order list", orderDetails, alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on rendering the admin order page ${err}`);
    }


}

// render order page
const viewOrder=async(req,res)=>{
    try {
        const orderID=req.params.orderID;

        const orderDetails=await orderSchema.findById(orderID).populate('products.productID')

        res.render('admin/orderStatus',{title:"Order status",orderDetails,alertMessage:req.flash('errorMessage')})

        
    } catch (err) {
        console.log(`Error on rendering the view order page in admin ${err}`);
    }
}

// edit the order status
const editOrder = async (req, res) => {
    try {
        const orderID = req.params.orderID
        const orderStatus = parseInt(req.body.orderStatus)
        const productDeliveryStatusEnum = ['Confirmed','Shipping', 'Delivered', 'Returned', 'Cancelled']

        const order = await orderSchema.findById(orderID)

    // change the order status 
        order.orderStatus= productDeliveryStatusEnum[orderStatus]

        // if the order status is delivered then set the delivery date
        if(order.orderStatus==="Delivered"){
            order.deliveryDate=new Date()
        }

        await order.save()



        req.flash('errorMessage', 'Order status updated')
        res.redirect('/admin/orders')

    } catch (err) {
        console.log(`Error on changing the order status ${err}`);
    }
}


module.exports = {
    order,
    viewOrder,
    editOrder,

}