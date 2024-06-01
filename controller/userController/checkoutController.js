const cartSchema = require("../../model/cartSchema")
const userSchema = require("../../model/userSchema")
const orderSchema = require('../../model/orderSchema')



const checkout = async (req, res) => {
    try {

        // find the user address
        const userAddress = await userSchema.findById(req.session.user)

        // get the address section from the userAddress
        const addressData = userAddress.address

        // get all cart items
        const cartDetails = await cartSchema.findOne({ userID: req.session.user }).populate("items.productID")

        // get the list of items in the cart
        const cartItems = cartDetails.items



        res.render('user/checkout', { title: "Checkout", addressData, cartItems, cartDetails, alertMessage: req.flash('errorMessage') })

    } catch (err) {
        console.log(`Error on rendering the checkout page ${err}`)
    }
}


// place order post method
const placeOrder = async (req, res) => {
    try {

        // address index and payment mode
        const addressIndex = req.params.address
        const paymentMode = req.params.payment
        const cartItems = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')

        const products = []
        let totalQuantity = 0
        const paymentDetails = [
            "cash on delivery",
            "UPI"
        ]

        cartItems.items.forEach((ele) => {

            // check the product count is available at the product stock
            if (ele.productID.productQuantity - ele.productCount < 0) {
                req.flash('errorMessage', 'The selected quantity for one or more items is not available. Please adjust your order and try again.')
                return res.redirect('/user/cart')
            }

            // add each products details in the cart to an array called products
            products.push({
                productID: ele.productID._id,
                productName: ele.productID.productName,
                brand: ele.productID.productBrand,
                quantity: ele.productCount,
                price: ele.productID.productPrice,
                productStatus: "Order placed",
                discountPrice: ele.productID.productDiscount,
                productImage: ele.productID.productImage[0]
            })

            // increment the product total quantity
            totalQuantity += ele.productCount
        })

        // find the user details 
        const userDetails = await userSchema.findById(req.session.user)

        // add a new order 
        const newOder = new orderSchema({
            userID: req.session.user,
            products: products,
            totalQuantity: totalQuantity,
            totalPrice: cartItems.payableAmount,
            address: {
                contactName: userDetails.address[addressIndex].contactName,
                pincode: userDetails.address[addressIndex].pincode,
                homeAddress: userDetails.address[addressIndex].homeAddress,
                areaAddress: userDetails.address[addressIndex].areaAddress,
                landmark: userDetails.address[addressIndex].landmark
            },
            paymentMethod: paymentDetails[paymentMode],
            orderDate: Date.now()
        })

        // save the updated data to collection
        newOder.save().then(async () => {
            await cartItems.deleteOne({ userID: req.session.user })

            // reduce the number of products purchased from the product stock
            cartItems.items.forEach((ele) => {
                ele.productID.productQuantity -= ele.productCount
            })

            req.flash('errorMessage', 'Thank you for your purchase! Your order has been successfully placed.')
            res.redirect('/user/orders')
        }).catch((err) => {
            req.flash('errorMessage', `Error occurred while confirming the order ${err}`)
            return res.redirect('/user/cart')
        })




    } catch (err) {
        console.log(`Error on placing order in POST method ${err}`);
    }
}


// delete address using fetch
const deleteAddressFetch = async (req, res) => {
    try {
        const addressIndex = req.params.id;

        // Get the current user data from the collection
        const user = await userSchema.findById(req.session.user);

        // Remove the address at the specified index in the user's address array
        user.address.splice(addressIndex, 1);

        // Save the updated user document
        user.save().then(() => {
            return res.status(200).json({ message: "User address deleted successfully" })
        }).catch((err) => {
            console.log(`Error on deleting user address ${err}`);
            return res.status(404).json({ error: "unable to delete the user address " })
        })


    } catch (err) {
        console.log(`Error on deleting the user address ${err}`)
    }
}


// add new address from checkout page
const addAddressCheckout = async (req, res) => {
    try {
        // user address details added
        const userAddress = {
            contactName: req.body.name,
            pincode: req.body.pincode,
            homeAddress: req.body.addressHome,
            areaAddress: req.body.addressArea,
            landmark: req.body.addressLandmark
        }

        // get current user data from collection
        const user = await userSchema.findById(req.session.user)

        // if maximum address size reached then redirect to login page
        if (user.address.length > 3) {
            req.flash("errorMessage", "Maximum Address limit Reached")
            return res.redirect('/user/profile')
        }


        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        req.flash('errorMessage', 'New address added')
        res.redirect('/user/checkout')
    } catch (err) {
        console.log(`Error on adding new address from checkout ${err}`);
    }
}

const editAddressCheckout = async (req, res) => {
    try {

        const addressIndex = req.params.id
        const userAddress = {
            contactName: req.body.name,
            pincode: req.body.pincode,
            homeAddress: req.body.addressHome,
            areaAddress: req.body.addressArea,
            landmark: req.body.addressLandmark
        }
        // get current user data from collection
        const user = await userSchema.findById(req.session.user)

        user.address[addressIndex] = userAddress
        await user.save();

        req.flash('errorMessage', 'Address edited')
        res.redirect('/user/checkout')

    } catch (err) {
        console.log(`Error on editing the user address on checkout ${err}`)
    }
}

module.exports = {
    checkout,
    placeOrder,
    deleteAddressFetch,
    addAddressCheckout,
    editAddressCheckout,
}