const cartSchema=require('../../model/cartSchema')



const cart = (req, res) => {
    try {
        
        res.render('user/cart', { title: "cart", alertMessage: req.flash('errorMessage'),user:req.session.user })
    } catch (err) {
        console.log(`Error during rendering cart ${err}`);
    }

}

// add to cat post method
const addToCartPost=async (req,res)=>{
    try {
        
        // product id of the product to be added to the cart collection
        const productID=req.params.id
        const userID=req.session.user
        const productPrice=req.query.price
        const productQuantity=1

        // check the user have cart already
        const checkUserCart=await cartSchema.findOne({userID:req.session.user})

        // if the user have a cart then cart is updated
        if(checkUserCart){

            let productExist=false;
            // check if product already exist 
            checkUserCart.items.forEach(product => {
                if (product.productID === productID) {
                    product.productPrice=productPrice
                    if (product.productCount < 10) {
                        product.productCount += productQuantity;
                    } else {
                        req.flash('errorMessage', 'Your order has reached the product limit. Please add additional items in your next order.');
                    }
                    productExist = true;
                }
            });

            // if product not exist in cart add the product
            if(!productExist){
                checkUserCart.items.push({productID:productID,productCount:productQuantity,productPrice:productPrice})
            }

            // save the modified data in cart collection
            await checkUserCart.save()


        }else{

            // if the user does not have a cart then a cart is created 
            const newCart= new cartSchema({
                userID:userID,
                items:[{productID:productID,productCount:productQuantity,productPrice:productPrice}]
            })

            await newCart.save();
        }

        res.redirect(`/user/product-view/${productID}`)


        
    } catch (err) {
        console.log(`Error during adding product to cart post using fetch ${err}`);
    }
}



module.exports={
    cart,
    addToCartPost,
}