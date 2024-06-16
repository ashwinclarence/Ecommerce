
const orderSchema = require("../../model/orderSchema");



// render the order page 
const order = async (req, res) => {
    try {
        const productsPerPage = 10;  // Number of products per page
        const currentPage = parseInt(req.query.page) || 1;  // Current page from query parameter, default to 1

        const skip = (currentPage - 1) * productsPerPage;

        const orderSearch=req.query.search;

        // get the order details from order collection (
        const orderDetails = await orderSchema.find().populate('products.productID').skip(skip).limit(productsPerPage).sort({createdAt:-1})

        // Count total number of products
        const totalProducts = await orderSchema.find();

        // Calculate total number of pages
        const pageNumber = Math.ceil(totalProducts.length / productsPerPage);

        // find the blocked products count
        let blockedProducts=0
        totalProducts.forEach((ele)=>{
            if(ele.isActive===false){
                blockedProducts++
            }
        })

     
        res.render('admin/order', { title: "Order list", 
            alertMessage: req.flash('errorMessage'), 
            orderDetails,
            pageNumber,
            currentPage,
            totalProducts:totalProducts.length, 
            blockedProducts
        })
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