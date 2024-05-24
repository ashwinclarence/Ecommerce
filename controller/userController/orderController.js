const checkoutSchema = require("../../model/checkoutSchema");





const order = async (req, res) => {
    try {

        const orderDetails=await checkoutSchema.find({userID:req.session.user})
        console.log("🚀 ~ file: orderController.js:11 ~ order ~ orderDetails:", orderDetails)

        // orderDetails.

                                                                                                                                                                                                                                                                                                                   
        res.render('user/orders',{title:"Order",user:req.session.user,alertMessage:req.flash('errorMessage')})
    } catch (err) {
        console.log(`Error rendering the order page ${err}`);
    }
}



// route @ /cancelled-order
// render the cancelled order page
const cancelledOrder=(req,res)=>{
    try {

        res.render('user/cancelledOrder',{title:"Cancelled Orders",user:req.session.user,alertMessage:req.flash('errorMessage')})
        
    } catch (err) {
        console.log(`Error rendering the cancelled order page ${err}`);
    }
}

module.exports = {
    order,
    cancelledOrder
}