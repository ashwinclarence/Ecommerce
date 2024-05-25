
const orderSchema = require("../../model/orderSchema");



// render the order page 
const order = async (req, res) => {
    try {

        // get the order details from order collection 
        const orderDetails=await orderSchema.aggregate([{$unwind:"$products"}])
        console.log("🚀 ~ file: orderController.js:12 ~ order ~ orderDetails:", orderDetails)

        
        res.render('admin/order', { title: "Order list",orderDetails, alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on rendering the admin order page ${err}`);
    }


}


module.exports={
    order,
}