const cartSchema = require('../../model/cartSchema')
const productSchema = require('../../model/productSchema')


// render the cart with items in the cart
const cart = async (req, res) => {
    try {

        // get the cart items from the collection 
        const cart = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')

        var totalPrice = 0;
        var totalPriceWithoutDiscount = 0

        if (cart != null) {

            // find the total price of cart items
            cart.items.forEach((ele) => {
                // if the product have discount then find the total price after making a discount from the actual price
                if (ele.productID.productDiscount === 0) {
                    totalPrice += (ele.productID.productPrice * ele.productCount);
                    totalPriceWithoutDiscount += (ele.productID.productPrice * ele.productCount)
                } else {
                    // get the product discount price from the product price
                    const discountPrice = (ele.productID.productPrice * ele.productCount) - ((ele.productID.productDiscount / 100) * (ele.productID.productPrice * ele.productCount))
                    totalPrice += discountPrice
                    totalPriceWithoutDiscount += (ele.productID.productPrice * ele.productCount)
                }
            })

            // if the totalPrice and payable amount in the cart and the calculated total price is different then update the collection with the new values
            if (cart.payableAmount != totalPrice || cart.totalPrice != totalPriceWithoutDiscount) {
                // update the price details
                cart.payableAmount = Math.round(totalPrice);
                cart.totalPrice = Math.round(totalPriceWithoutDiscount);
            }

            //   save the changes in the collection
            await cart.save()

            // render the cart
            res.render('user/cart', { title: "cart", cart: cart.items, totalPrice, totalPriceWithoutDiscount, alertMessage: req.flash('errorMessage'), user: req.session.user })
        } else {

            // render the cart
            res.render('user/cart', { title: "cart", cart: [], totalPrice, totalPriceWithoutDiscount, alertMessage: req.flash('errorMessage'), user: req.session.user })
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
        const productPrice = parseInt(req.query.price)
        const productQuantity = 1

        // find the product from collection
        const actualProductDetails = await productSchema.findById(productID)

        // check the user have cart already
        const checkUserCart = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')

        // if user has cart already
        if (checkUserCart) {
            let productExist = false

            // check the product exist in the cart 
            checkUserCart.items.forEach((ele) => {
                if (ele.productID.id === productID) {
                    // ele.productCount=productQuantity
                    // ele.productPrice=ele.productID.productPrice
                    productExist = true
                }
            })

            // if the product not exist in the cart
            if (!productExist) {
                checkUserCart.items.push({ productID: actualProductDetails._id, productCount: 1, productPrice: productPrice })
            }

            // save the changes in the collection
            await checkUserCart.save()

        } else {

            // create a new cart
            const newCart = new cartSchema({
                userID: userID,
                items: [{ productID: actualProductDetails._id, productCount: 1, productPrice: productPrice }],
            })

            // save the changes in collection
            await newCart.save()

        }

        res.redirect(`/user/product-view/${productID}`)

    } catch (err) {
        console.log(`Error during adding product to cart post  ${err}`);
    }




}



// product count using fetch
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
        const cartItem = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')


        // filter out the current product from the items inside the cart collections
        const currentProduct = cartItem.items.filter((item) => {
            if (item.productID.id === productID) {
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


// remove product from cart
const removeCartItem = async (req, res) => {
    try {

        // product of the product to remove from cart
        const productID = req.params.id;

        // get the cart items
        const cartItems = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')


        if (cartItems === null) {
            return res.status(404).json({ error: "An error occurred while removing the product" })
        }

        // filter out the cart products without the removed products
        const newCart = cartItems.items.filter((ele) => {
            if (ele.productID.id != productID) {
                return ele
            }
        })

        // update the cart items without the removed the product from cart
        cartItems.items = newCart

        // save the changes in collection
        await cartItems.save()

        return res.status(200).json({ message: "Product removed from cart" })

    } catch (err) {
        console.log(`Error during removing the product from cart using fetch ${err}`);
        return res.status(500).json({ error: `An error occurred while removing the product from cart ${err}` })
    }
}



module.exports = {
    cart,
    addToCartPost,
    cartCountFetch,
    removeCartItem,
}