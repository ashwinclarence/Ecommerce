const cartSchema = require("../../model/cartSchema")
const userSchema = require("../../model/userSchema")
const orderSchema = require('../../model/orderSchema')
const productSchema = require("../../model/productSchema")
const walletSchema = require('../../model/walletSchema')
const mongoose = require('mongoose')
const Razorpay = require('razorpay')
const dotenv = require('dotenv').config()



// confirm order page   
const orderConfirmPage = (req, res) => {
    try {
        res.render('user/confirmOrder', { title: "Order confirmed" })
    } catch (err) {
        console.log(`Error on rendering the confirm order tick page ${err}`);

    }
}

// pending order page animation
const pendingOrderPage = (req, res) => {
    try {
        res.render('user/pendingOrder', { title: "Pending order" })
    } catch (err) {
        console.log(`Error on rendering the pending order page ${err}`);

    }
}

// render the checkout page
const checkout = async (req, res) => {
    try {
        // Find the user's address
        const userAddress = await userSchema.findById(req.session.user);

        // Get the address section from the userAddress
        const addressData = userAddress.address;

        // get the wallet balance of the user
        let balance = 0
        const wallet = await walletSchema.findOne({ userID: req.session.user })
        if (wallet) {
            balance = wallet.balance
        }

        // Get all cart items
        const cartDetails = await cartSchema.findOne({ userID: req.session.user }).populate("items.productID");

        // Get the list of items in the cart
        const cartItems = cartDetails.items;

        // Check if current product quantity is available or not
        for (const item of cartDetails.items) {
            if (item.productID.productQuantity === 0 || item.productID.productQuantity < item.productCount) {
                req.flash('errorMessage', 'The selected quantity for one or more items is not available. Please adjust your order and try again.');
                return res.redirect('/cart');
            }
        }


        // Render the checkout page with fetched data
        res.render('user/checkout', {
            title: "Checkout",
            addressData,
            cartItems,
            cartDetails,
            user: userAddress,
            wallet: balance,
            alertMessage: req.flash('errorMessage')
        });

    } catch (err) {
        // Handle any errors
        console.log(`Error on rendering the checkout page ${err}`);
        // You might want to redirect or render an error page here
    }
}



// place order post method
const placeOrder = async (req, res) => {
    try {
        const addressIndex = req.body.addressIndex;
        const paymentMode = parseInt(req.body.paymentMode);
        let paymentId = "";

        if (paymentMode === 1) {
            const razorpay_payment_id = req.body.razorpay_payment_id;
            const razorpay_order_id = req.body.razorpay_order_id;
            const razorpay_signature = req.body.razorpay_signature;
            paymentId = razorpay_payment_id;

            // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
            // const isValidPayment = instance.utils.validatePaymentVerification(
            //     { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
            //     razorpay_signature, n
            //     process.env.RAZORPAY_KEY_SECRET
            // );

            // if (!isValidPayment) {
            //     return res.status(400).json({ error: "Invalid payment verification" });
            // }
        }

        const cartItems = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID');
        const paymentDetails = ["Cash on delivery", "Razor pay", "Wallet"];
        const products = [];
        let totalQuantity = 0;

        cartItems.items.forEach((ele) => {
            products.push({
                productID: ele.productID._id,
                productName: ele.productID.productName,
                brand: ele.productID.productBrand,
                quantity: ele.productCount,
                price: ele.productID.productPrice,
                discount: ele.productID.productDiscount,
                productImage: ele.productID.productImage[0]
            });
            totalQuantity += ele.productCount;
        });

        const userDetails = await userSchema.findById(req.session.user);
        const newOrder = new orderSchema({
            userID: req.session.user,
            products,
            totalQuantity,
            totalPrice: cartItems.payableAmount,
            address: {
                contactName: userDetails.address[addressIndex].contactName,
                pincode: userDetails.address[addressIndex].pincode,
                homeAddress: userDetails.address[addressIndex].homeAddress,
                areaAddress: userDetails.address[addressIndex].areaAddress,
                landmark: userDetails.address[addressIndex].landmark
            },
            paymentMethod: paymentDetails[paymentMode],
            orderStatus: "Confirmed",
            paymentId,
            couponDiscount: cartItems.couponDiscount,
            couponID: cartItems.couponID
        });
        await newOrder.save();

        if (paymentMode === 2) {
            const wallet = await walletSchema.findOne({ userID: req.session.user });
            if (wallet.balance < cartItems.payableAmount) {
                return res.status(400).json({ error: "Insufficient balance in the wallet. Please choose another payment option" });
            }
            wallet.balance -= cartItems.payableAmount;
            await wallet.save();
        }

        for (const ele of cartItems.items) {
            const product = await productSchema.findById(ele.productID._id);
            if (product) {
                product.productQuantity -= ele.productCount;
                product.productQuantity = Math.max(product.productQuantity, 0);
                await product.save();
            }
        }

        await cartSchema.deleteOne({ userID: req.session.user });
        return res.status(200).json({ success: "Order placed successfully" });

    } catch (err) {
        console.log(`Error on placing order in POST method ${err}`);
        return res.status(500).json({ error: `Error on placing order: ${err.message}` });
    }
};



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
            return res.redirect('/profile')
        }


        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        req.flash('errorMessage', 'New address added')
        res.redirect('/checkout')
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
        res.redirect('/checkout')

    } catch (err) {
        console.log(`Error on editing the user address on checkout ${err}`)
    }
}

// payment sessions order render
const paymentRender = (req, res) => {
    try {

        // get the amount from the fetch request
        const totalAmount = req.params.amount
        if (!totalAmount) {
            return res.status(404).json({ error: "Amount parameter is missing" })
        }

        const instance = new Razorpay({ key_id: "rzp_test_7sxqZBOSt6LOIS", key_secret: "culRJFIwYb7QxSNffP6mwqc1" })


        // create an order instance 
        instance.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "receipt#1",
        }, (err, order) => {
            if (err) {
                console.error(`Failed to create order: ${err}`);
                return res.status(500).json({ error: `Failed to create order: ${err.message}` });
            }

            // If there is no error then send back the order id
            return res.status(200).json({ orderID: order.id });
        })

    } catch (err) {
        console.error(`Error on orders in checkout: ${err}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const failedPayment = async (req, res) => {
    try {


        const cartItems = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')
        const products = []
        let totalQuantity = 0


        cartItems.items.forEach((ele) => {

            // add each products details in the cart to an array called products
            products.push({
                productID: ele.productID._id,
                productName: ele.productID.productName,
                brand: ele.productID.productBrand,
                quantity: ele.productCount,
                price: ele.productID.productPrice,
                discount: ele.productID.productDiscount,
                productImage: ele.productID.productImage[0]
            })
            // increment the product total quantity
            totalQuantity += ele.productCount
        })

        // find the user details 
        const userDetails = await userSchema.findById(req.session.user)

        // add a new order 
        const newOrder = new orderSchema({
            userID: req.session.user,
            products: products,
            totalQuantity: totalQuantity,
            totalPrice: cartItems.payableAmount < 550 ? cartItems.payableAmount - 50 : cartItems.payableAmount,
            paymentMethod: "Razor pay",
            orderStatus: "Pending",
            couponDiscount: cartItems.couponDiscount
        })


        // Save the new order
        await newOrder.save();

        // Clear the cart for the user
        await cartSchema.deleteOne({ userID: req.session.user });

        req.flash('errorMessage', '"Payment could not be processed. Please attempt your purchase again at a later time."');
        res.redirect('/orders');

    } catch (err) {
        console.log(`Error on handling the failed payment ${err}`);
    }
}


// proceed with payment
const proceedPayment = async (req, res) => {
    try {

        const { orderID } = req.params;

        const order = await orderSchema.findById(orderID)

        const cart = await cartSchema.findOne({ userID: req.session.user })
        const items = [];
        let totalPrice = 0;
        let totalQuantity = 0
        order.products.forEach((product) => {
            items.push({
                productID: product.productID,
                productCount: product.quantity,
                productPrice: product.price
            })
            totalPrice += product.price * product.quantity
            totalQuantity += product.quantity
        })




        if (cart) {
            const deleteCart = await cartSchema.findByIdAndDelete(cart.id)

            const newCart = new cartSchema({
                userID: req.session.user,
                items: items,
                payableAmount: order.totalPrice,
                totalPrice: totalPrice,
                couponDiscount: 0
            })

            await newCart.save()

            const deleteOrder = await orderSchema.findByIdAndDelete(orderID)
            return res.json({ redirect: true, url: '/proceed-checkout' });

        } else {
            const newCart = new cartSchema({
                userID: req.session.user,
                items: items,
                payableAmount: order.totalPrice,
                totalPrice: totalPrice,
                couponDiscount: 0
            })
            await newCart.save()
            const deleteOrder = await orderSchema.findByIdAndDelete(orderID)
            return res.json({ redirect: true, url: '/proceed-checkout' });
        }




    } catch (err) {
        console.log("Error on proceeding with failed payment ", err);
    }
}

module.exports = {
    orderConfirmPage,
    checkout,
    placeOrder,
    deleteAddressFetch,
    addAddressCheckout,
    editAddressCheckout,
    paymentRender,
    failedPayment,
    pendingOrderPage,
    proceedPayment
}

