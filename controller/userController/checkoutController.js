const cartSchema = require("../../model/cartSchema")
const userSchema = require("../../model/userSchema")
const checkoutSchema=require('../../model/checkoutSchema')

const checkout=async (req,res)=>{
    try {

        // find the user address
        const userAddress=await userSchema.findById(req.session.user)

        // get the address section from the userAddress
        const addressData=userAddress.address

        // get all cart items
        const cartDetails=await cartSchema.findOne({userID:req.session.user}).populate("items.productID")

        // get the list of items in the cart
        const cartItems=cartDetails.items



        res.render('user/checkout',{title:"Checkout",addressData,cartItems,cartDetails,alertMessage:req.flash('errorMessage')})
        
    } catch (err) {
        console.log(`Error on rendering the checkout page ${err}`)
    }
}


// place order post method
const placeOrder=async(req,res)=>{
    try {

        // address index and payment mode
        const addressIndex=req.params.address
        const paymentMode=req.params.payment
        const cartItems=await cartSchema.findOne({userID:req.session.user}).populate('items.productID')

        const products=[]
        let totalQuantity=0
        const paymentDetails=[
            "cash on delivery",
            "UPI"
        ]

        cartItems.items.forEach((ele)=>{
            // add each products details in the cart to an array called products
            products.push({
                productID:ele.productID._id,
                productName:ele.productID.productName,
                brand:ele.productID.productBrand,
                quantity:ele.productCount,
                price:ele.productID.productPrice,
                productStatus:"Order placed",
                discountPrice:ele.productID.productDiscount,
            })

            // increment the product total quantity
            totalQuantity+=ele.productCount
        })

        const userDetails=await userSchema.findById(req.session.user)
        
        // 
        const newOder=new checkoutSchema({
            userID: req.session.user,
            products:products,
            totalQuantity: totalQuantity,
            totalPrice: cartItems.payableAmount,
            address: {
                contactName:userDetails.address[addressIndex].contactName,
                pincode:userDetails.address[addressIndex].pincode,
                homeAddress:userDetails.address[addressIndex].homeAddress,
                areaAddress:userDetails.address[addressIndex].areaAddress,
                landmark:userDetails.address[addressIndex].landmark
            },
            paymentMethod: paymentDetails[paymentMode],
            orderDate: Date.now()
        })
         
        // save the updated data to collection
        newOder.save().then(async()=>{
            await cartItems.deleteOne({userID:req.session.user})
            req.flash('errorMessage','Thank you for your purchase! Your order has been successfully placed.')
            res.redirect('/user/orders')
        }).catch((err)=>{
            req.flash('errorMessage',`Error occurred while confirming the order ${err}`)
            return res.redirect('/user/cart')
        })


        
        
    } catch (err) {
        console.log(`Error on placing order in POST method ${err}`);
    }
}


module.exports={
    checkout,
    placeOrder,
}