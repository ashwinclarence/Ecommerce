const cartSchema = require('../../model/cartSchema')
const productSchema = require('../../model/productSchema')


// render the cart with items in the cart
const cart = async (req, res) => {
    try {

        // get the cart items from the collection 
        const cart = await cartSchema.findOne({ userID: req.session.user })

        if (cart!=null) {
            // an empty array for the cart products ID's
            const cartProductID = []

            // push all the product's ID to the cartProduct
            cart.items.forEach((items) => {
                cartProductID.push(items.productID)
            })

            // find the products details from the productID's
            const cartItems = await productSchema.find({ _id: { $in: cartProductID } })


            const productsArray = []
            cart.items.forEach((ele) => {
                const obj = {
                    productID: ele.productID,
                    productPrice: ele.productPrice
                }
                productsArray.push(obj)
            })

            



            // find the total price of cart
            var totalPrice = 0;
            var totalPriceWithoutDiscount = 0
            cartItems.forEach((products) => {

                // for the product with no discount then add the productPrice with the total price
                if (products.productDiscount === 0) {
                    totalPrice = products.productPrice + totalPrice
                    totalPriceWithoutDiscount = products.productPrice + totalPriceWithoutDiscount
                } else {
                    // if the product have discount then find the discounted amount and add then with the totalPrice
                    const discountedPrice = (products.productDiscount / 100) * products.productPrice
                    totalPrice = discountedPrice + totalPrice
                    totalPriceWithoutDiscount = products.productPrice + totalPriceWithoutDiscount
                }
            })
            // render the cart
            res.render('user/cart', { title: "cart", cart: cartItems, totalPrice, totalPriceWithoutDiscount, alertMessage: req.flash('errorMessage'), user: req.session.user })
            
        }else{
            res.render('user/emptyCart', { title: "cart", alertMessage: req.flash('errorMessage'), user: req.session.user })

        }



    } catch (err) {
        console.log(`Error during rendering cart ${err}`);
    }

}

// add to cat post method 
const addToCartPost = async (req, res) => {
    try {

        // product id of the product to be added to the cart collection
        const productID = req.params.id
        const userID = req.session.user
        const productPrice = req.query.price
        const productQuantity = 1

        // find the product from collection
        const actualProductDetails = await productSchema.findById(productID)

        // check the user have cart already
        const checkUserCart = await cartSchema.findOne({ userID: req.session.user })

        // if the user have a cart then cart is updated
        if (checkUserCart) {

            let productExist = false;
            // check if product already exist 
            checkUserCart.items.forEach(product => {
                if (product.productID === productID) {
                    product.productPrice = productPrice
                    if (product.productCount < 10) {
                        product.productCount += productQuantity;
                    } else {
                        req.flash('errorMessage', 'Your order has reached the product limit. Please add additional items in your next order.');
                    }
                    productExist = true;
                }
            });

            // if product not exist in cart add the product
            if (!productExist) {
                checkUserCart.items.push({ productID: actualProductDetails._id , productCount: productQuantity, productPrice: productPrice })
            }

            // save the modified data in cart collection
            await checkUserCart.save()


        } else {

            // if the user does not have a cart then a cart is created 
            const newCart = new cartSchema({
                userID: userID,
                items: [{ productID: actualProductDetails._id, productCount: productQuantity, productPrice: productPrice }],
            })

            // save the update in the cart 
            await newCart.save();
        }

        res.redirect(`/user/product-view/${productID}`)



    } catch (err) {
        console.log(`Error during adding product to cart post using fetch ${err}`);
    }
}




const cartCountFetch = async (req, res) => {
    try {

        // product id from the request
        const productID = req.params.id;

        // product count from the dropdown
        const productCount = parseInt(req.query.productCount)


        if (productCount <= 0 || isNaN(productCount)) {
            return res.status(404).json({ error: "Error Invalid product count" })
        }

        // get the cart details of the current user
        const cartItem = await cartSchema.findOne({ userID: req.session.user })

        // filter out the current product from the items inside the cart collections
        const currentProduct = cartItem.items.filter((item) => {
            if (item.productID === productID) {
                return item
            }
        })

        // update the product count of the product in the collection with the selected count
        currentProduct[0].productCount = productCount

        // save the changes to the database
        await cartItem.save()

        // return the success message to the fetch 
        return res.status(200).json({ message: "Product Count updated" })


    } catch (err) {
        console.log(`Error during updating the count of products in cart using FETCH ${err}`);
        return res.status(500).json({ error: `An error occurred while updating the product count ${err}` })
    }
}



module.exports = {
    cart,
    addToCartPost,
    cartCountFetch,
}