const cartSchema = require("../../model/cartSchema");
const productSchema = require("../../model/productSchema");
const couponSchema = require("../../model/couponSchema");
const userSchema = require("../../model/userSchema");
const orderSchema = require("../../model/orderSchema");

// render the cart with items in the cart
const cart = async (req, res) => {
    try {
        // get the cart items from the collection
        const cart = await cartSchema
            .findOne({ userID: req.session.user })
            .populate("items.productID");

        var totalPrice = 0;
        var totalPriceWithoutDiscount = 0;
        // get the coupons
        const coupons = await couponSchema.find({
            isActive: true,
            expiryDate: { $gte: new Date() },
        });

        if (cart) {
            // find the total price of cart items
            cart.items.forEach((ele) => {
                // if the product have discount then find the total price after making a discount from the actual price
                if (ele.productID.productDiscount === 0) {
                    totalPrice += ele.productID.productPrice * ele.productCount;
                    totalPriceWithoutDiscount +=
                        ele.productID.productPrice * ele.productCount;
                } else {
                    // get the product discount price from the product price
                    const discountPrice =
                        ele.productID.productPrice * ele.productCount -
                        (ele.productID.productDiscount / 100) *
                        (ele.productID.productPrice * ele.productCount);
                    totalPrice += discountPrice;
                    totalPriceWithoutDiscount +=
                        ele.productID.productPrice * ele.productCount;
                }
            });

            // remove anything that exist in cart coupon discount
            const couponID = cart.couponID;
            if (cart.couponDiscount) {
                cart.couponDiscount = 0;
                cart.couponID = null;
                await cart.save();

                // remove the applied user fromm the coupon
                const coupon = await couponSchema
                    .findById(couponID)
                    .populate("appliedUsers");
                const newAppliedUser = coupon.appliedUsers.filter((ele) => {
                    if (ele.id != req.session.user) {
                        return ele;
                    }
                });

                coupon.appliedUsers = newAppliedUser;
                await coupon.save();
            }

            // if the totalPrice and payable amount in the cart and the calculated total price is different then update the collection with the new values
            if (
                cart.payableAmount != totalPrice ||
                cart.totalPrice != totalPriceWithoutDiscount
            ) {
                // update the price details
                cart.payableAmount = Math.round(totalPrice);
                cart.totalPrice = Math.round(totalPriceWithoutDiscount);
                //   save the changes in the collection
                await cart.save();
            }
            // sort cart based on date of added
            cart.items.sort((a, b) => b.createdAt - a.createdAt);
        }
        // render the cart
        res.render("user/cart", {
            title: "cart",
            cart,
            coupons,
            alertMessage: req.flash("errorMessage"),
            user: req.session.user,
        });
    } catch (err) {
        console.log(`Error during rendering cart ${err}`);
    }
};

// add to cart fetch
const addToCartPost = async (req, res) => {
    try {
        const productID = req.params.id;
        const userID = req.session.user;
        const productPrice = parseInt(req.query.price);

        // Find the product from the collection
        const actualProductDetails = await productSchema.findById(productID);

        if (!actualProductDetails || actualProductDetails.productQuantity <= 0) {
            return res.status(404).json({ error: "Product is out of stock" });
        }

        // Check if the user already has a cart
        const userCart = await cartSchema
            .findOne({ userID })
            .populate("items.productID");

        if (userCart) {
            const productExists = userCart.items.some(
                (item) => item.productID.id === productID
            );

            if (productExists) {
                return res
                    .status(400)
                    .json({ error: "Product already exists in the cart" });
            } else {
                userCart.items.push({
                    productID: actualProductDetails._id,
                    productCount: 1,
                    productPrice,
                });
                await userCart.save();
            }
        } else {
            const newCart = new cartSchema({
                userID,
                items: [
                    {
                        productID: actualProductDetails._id,
                        productCount: 1,
                        productPrice,
                    },
                ],
            });
            await newCart.save();
        }

        return res.status(200).json({ success: "Product added to cart" });
    } catch (err) {
        console.error(`Error adding product to cart: ${err}`);
        return res
            .status(500)
            .json({ error: `Cannot add product to cart: ${err}` });
    }
};

// product count using fetch
const cartCountFetch = async (req, res) => {
    try {
        // product id from the request
        const productID = req.params.id;

        // product count from the dropdown
        const productCount = parseInt(req.query.productCount);

        if (productCount <= 0 || isNaN(productCount)) {
            return res.status(404).json({ error: "Error Invalid product count" });
        }

        // get the cart details of the current user
        const cartItem = await cartSchema
            .findOne({ userID: req.session.user })
            .populate("items.productID");

        // filter out the current product from the items inside the cart collections
        const currentProduct = cartItem.items.filter((item) => {
            if (item.productID.id === productID) {
                return item;
            }
        });

        // if the product stock is not enough then show an error
        if (currentProduct[0].productID.productQuantity - productCount < 0) {
            return res
                .status(422)
                .json({
                    error:
                        "Please reduce the product count. The selected quantity is not available right now",
                    message: currentProduct[0].productID.productQuantity,
                });
        }

        // update the product count of the product in the collection with the selected count
        currentProduct[0].productCount = productCount;

        // save the changes to the database
        await cartItem.save();

        // return the success message to the fetch
        return res.status(200).json({ message: "Product Count updated" });
    } catch (err) {
        console.log(
            `Error during updating the count of products in cart using FETCH ${err}`
        );
        return res
            .status(500)
            .json({
                error: `An error occurred while updating the product count ${err}`,
            });
    }
};

// remove product from cart
const removeCartItem = async (req, res) => {
    try {
        // product of the product to remove from cart
        const productID = req.params.id;

        // get the cart items
        const cartItems = await cartSchema
            .findOne({ userID: req.session.user })
            .populate("items.productID");

        if (cartItems === null) {
            return res
                .status(404)
                .json({ error: "An error occurred while removing the product" });
        }

        // filter out the cart products without the removed products
        const newCart = cartItems.items.filter((ele) => {
            if (ele.productID.id != productID) {
                return ele;
            }
        });

        // update the cart items without the removed the product from cart
        cartItems.items = newCart;

        // save the changes in collection
        await cartItems.save();

        return res.status(200).json({ message: "Product removed from cart" });
    } catch (err) {
        console.log(
            `Error during removing the product from cart using fetch ${err}`
        );
        return res
            .status(500)
            .json({
                error: `An error occurred while removing the product from cart ${err}`,
            });
    }
};

// increment the product quantity
const incrementProduct = async (req, res) => {
    try {
        const productID = req.params.productID;
        const productQuantity = req.body.quantity;

        if (!productQuantity) {
            return res.status(404).json({ error: "Product quantity not found" });
        }

        const cart = await cartSchema
            .findOne({ userID: req.session.user })
            .populate("items.productID");

        // filter out the current product from cart.items
        const productCart = cart.items.filter((ele) => {
            if (ele.productID.id === productID) {
                return ele;
            }
        });

        productCart[0].productCount += 1;
        if (productCart[0].productCount > productCart[0].productID.productQuantity) {
            return res
                .status(404)
                .json({
                    error: `Only ${productCart[0].productID.productQuantity} items left`,
                });
        }

        if (productCart[0].productCount > 10) {
            return res.status(404).json({error:"only 10 item can be purchase at once"})
        }

        let totalPrice = 0;
        let productTotal = 0;
        let totalPriceWithoutDiscount = 0;

        cart.items.forEach((ele) => {
            totalPriceWithoutDiscount +=
                ele.productID.productPrice * ele.productCount;
            totalPrice += ele.productID.productDiscountedPrice * ele.productCount;
            if (ele.productID.id === productID) {
                productTotal = ele.productID.productDiscountedPrice * ele.productCount;
            }
        });

        // update the total price of the cart
        cart.payableAmount = Math.round(totalPrice);
        cart.totalPrice = Math.round(totalPriceWithoutDiscount);

        await cart.save();

        let savings = totalPriceWithoutDiscount - totalPrice;

        // return the product quantity
        return res.status(200).json({
            productCount: productCart[0].productCount,
            productTotal: productTotal,
            total: totalPrice,
            subTotal: totalPriceWithoutDiscount,
            savings: savings,
        });
    } catch (err) {
        console.log(`Error on incrementing the product quantity ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// decrement the product quantity
const decrementProduct = async (req, res) => {
    try {
        const productID = req.params.productID;
        const productQuantity = req.body.quantity;

        if (!productQuantity) {
            return res.status(404).json({ error: "Product quantity not found" });
        }

        const cart = await cartSchema
            .findOne({ userID: req.session.user })
            .populate("items.productID");

        const productCart = cart.items.filter((ele) => {
            if (ele.productID.id === productID) {
                return ele;
            }
        });

        productCart[0].productCount -= 1;

        if (productCart[0].productCount < 1) {
            return res.status(404).json({error:"Minimum one product is required"})
        }


        let totalPrice = 0;
        let productTotal = 0;
        let totalPriceWithoutDiscount = 0;

        cart.items.forEach((ele) => {
            totalPriceWithoutDiscount +=
                ele.productID.productPrice * ele.productCount;
            totalPrice += ele.productID.productDiscountedPrice * ele.productCount;
            if (ele.productID.id === productID) {
                productTotal = ele.productID.productDiscountedPrice * ele.productCount;
            }
        });

        // update the total price of the cart
        cart.payableAmount = Math.round(totalPrice);
        cart.totalPrice = Math.round(totalPriceWithoutDiscount);

        await cart.save();

        let savings = totalPriceWithoutDiscount - totalPrice;

        // return the product quantity
        return res.status(200).json({
            productCount: productCart[0].productCount,
            productTotal: productTotal,
            total: totalPrice,
            subTotal: totalPriceWithoutDiscount,
            savings: savings,
        });
    } catch (err) {
        console.log(`Error on decrementing the product quantity ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// render the coupon details on the cart page using fetch
const getCoupon = async (req, res) => {
    try {
        const couponID = req.params.couponID;

        if (!couponID) {
            return res.status(404).json({ error: "coupon ID is missing" });
        }

        const coupon = await couponSchema.findById(couponID);
        if (!coupon) {
            return res.status(404).json({ error: "Cannot find the coupon" });
        }
        return res.status(200).json({
            discount: coupon.discount,
            minAmount: coupon.minAmount,
        });
    } catch (err) {
        console.log(`Error on getting coupon details on fetch ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// apply the coupon using fetch
const applyCoupon = async (req, res) => {
    try {
        const couponID = req.params.couponID;

        if (!couponID) {
            return res.status(404).json({ error: "cannot find the coupon id" });
        }

        const coupon = await couponSchema.findById(couponID)

        const orders = await orderSchema.find({ userID: req.session.user })
        
        // check the user already purchase the coupon
        for (const order of orders) {
            if (order.couponID === coupon.id) {
                return res.status(404).json({ error: "Coupon already Applied" });
            }
        }


        // check coupon is still active
        if (!coupon.isActive || coupon.expiryDate < new Date()) {
            return res.status(404).json({ error: "coupon expired" });
        }

        const cart = await cartSchema.findOne({ userID: req.session.user });

        // check the minimum purchase limit reached
        if (cart.payableAmount < coupon.minAmount) {
            return res
                .status(404)
                .json({
                    error:
                        "Minimum purchase limit not reached. Please add more items to your cart.",
                });
        }

        // find the total price after minus the coupon discount amount from total price from cart
        let totalAmountAfterCoupon = cart.payableAmount - coupon.discount;

        // save the coupon discount amount in the cart
        cart.couponDiscount = coupon.discount;
        cart.couponID = couponID;
        await cart.save();

        return res.status(200).json({
            message: "Coupon Applied",
            newPrice: totalAmountAfterCoupon,
            couponPrice: coupon.discount,
        });
    } catch (err) {
        console.log(`Error on applying coupon ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// remove the coupon that is already selected
const removeCoupon = async (req, res) => {
    try {
        const cart = await cartSchema.findOne({ userID: req.session.user });
        const couponID = cart.couponID;

        // remove anything that exist in cart coupon discount
        if (cart.couponDiscount) {
            cart.couponDiscount = 0;
            cart.couponID = null;
            await cart.save();

            // remove the applied user fromm the coupon
            const coupon = await couponSchema
                .findById(couponID)
                .populate("appliedUsers");
            const newAppliedUser = coupon.appliedUsers.filter((ele) => {
                if (ele.id != req.session.user) {
                    return ele;
                }
            });

            coupon.appliedUsers = newAppliedUser;
            await coupon.save();
        }

        return res.status(200).json({
            message: "Coupon Removed",
            newPrice: cart.payableAmount,
        });
    } catch (err) {
        console.log(`Error on removing the coupon from cart ${err}`);
    }
};

// before checkout validate the cart and discount the amount if coupon is added
const proceedCheckout = async (req, res) => {
    try {
        const cart = await cartSchema.findOne({ userID: req.session.user });

        // if the cart is empty then don't allow to checkout
        if (cart.payableAmount <= 0) {
            req.flash(
                "errorMessage",
                "Add some products in cart to proceed to checkout"
            );
            return res.redirect("/home");
        }
        // check is there a need to add shipping charge
        if (cart.payableAmount < 500) {
            cart.payableAmount += 50;
            await cart.save();
        }

        // if there is coupon added in the cart then reduce the amount
        if (cart.couponDiscount) {
            cart.payableAmount -= cart.couponDiscount;
            await cart.save();
        }

        res.redirect("/checkout");
    } catch (err) {
        console.log(`Error on proceed to checkout page ${err}`);
    }
};

module.exports = {
    cart,
    addToCartPost,
    cartCountFetch,
    removeCartItem,
    incrementProduct,
    decrementProduct,
    getCoupon,
    applyCoupon,
    removeCoupon,
    proceedCheckout,
};
