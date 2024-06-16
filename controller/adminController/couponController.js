
const voucher_codes = require('voucher-code-generator')
const couponSchema = require('../../model/couponSchema')



// render the coupons page 
const coupons = async (req, res) => {
    try {
        const productsPerPage = 10;  // Number of products per page
        const currentPage = parseInt(req.query.page) || 1;  // Current page from query parameter, default to 1

        const skip = (currentPage - 1) * productsPerPage;

        // search coupon 
        const couponSearch=req.query.search || "";

        // get all coupons available
        const coupon = await couponSchema.find({couponName:{$regex:couponSearch,$options:'i'}}).skip(skip).limit(productsPerPage).sort({createdAt:-1})

        res.render('admin/coupons', { title: "Coupons",coupon, alertMessage: req.flash('errorMessage') })

    } catch (err) {
        console.log(`Error on rendering coupon page ${err}`);
    }

}


// add new coupon using fetch
const addCoupon = async (req, res) => {
    try {


        // coupon name
        const couponName=req.body.couponName
        const trimmedCouponName=couponName.trim()
        // coupon code generator 
        const code = voucher_codes.generate({
            length: 9,
            count: 1,
            charset: "alphanumeric"
        })

        // redirect if coupon code is not generated
        if (!code[0]) {
            req.flash("errorMessage", "Error on creating a coupon code please try again");
            return res.redirect('/user/coupons')
        }

        // check if the same coupon exist or not 
        const checkCoupon = await couponSchema.find({couponName: {$regex:trimmedCouponName,$options:"i"}})
        if (checkCoupon.length != 0) {
            req.flash("errorMessage", "Coupon already exist")
            return res.redirect('/admin/coupons')
        }


        const newCoupon = new couponSchema({
            couponName: trimmedCouponName,
            couponCode: code[0],
            discount: req.body.discountAmount,
            minAmount: req.body.minAmount,
            expiryDate: req.body.expiryDate
        })

        await newCoupon.save()

        req.flash('errorMessage', 'New coupon added')
        res.redirect('/admin/coupons')

    } catch (err) {
        console.log(`Error on adding new coupon ${err}`)
    }
}

// edit coupon
const editCoupon=async (req,res)=>{
    try {
        const couponID=req.params.id;

        const checkCoupon=await couponSchema.findById(couponID)

        // if coupon not exist the redirect to login
        if(!checkCoupon){
            req.flash('errorMessage',"Cannot find the coupon please try again")
            return res.redirect('/admin/coupons')
        }
        
        let couponChange=false

        // change the values of the coupon if it is edited by the user
        if(checkCoupon.expiryDate!=req.body.newDate){
            console.log("🚀 ~ file: couponController.js:86 ~ editCoupon ~ checkCoupon.expiryDate!=req.body.newDate:", checkCoupon.expiryDate!=req.body.newDate);
            couponChange=true
            checkCoupon.expiryDate=req.body.newDate;
        }
        if(checkCoupon.discount!=req.body.newDiscount){
            console.log("🚀 ~ file: couponController.js:91 ~ editCoupon ~ checkCoupon.discount!=req.body.newDiscount:", checkCoupon.discount!=req.body.newDiscount);
            couponChange=true
            checkCoupon.discount=req.body.newDiscount;
        }
        if(checkCoupon.minAmount!=req.body.newMinPurchase){
            console.log("🚀 ~ file: couponController.js:96 ~ editCoupon ~ checkCoupon.minAmount!=req.body.newMinPurchase:", checkCoupon.minAmount!=req.body.newMinPurchase);
            couponChange=true
            checkCoupon.minAmount=req.body.newMinPurchase
        }

        if(couponChange){
            // save the changes in coupon collection
            await checkCoupon.save()
            req.flash("errorMessage",`${checkCoupon.couponName} Coupon Edited`)
           return res.redirect('/admin/coupons')
        }
        req.flash("errorMessage",`There is nothing to edit on ${checkCoupon.couponName}`)
        res.redirect('/admin/coupons')


    } catch (err) {
        console.log(`Error on editing coupon ${err}`);
    }
}


// block the coupon using fetch
const blockCoupon=async(req,res)=>{
    try {
        const couponID=req.params.id;

        if(!couponID){
            return res.status(404).json({error:"Cannot block the coupon right now please try again later"})
        }
        const coupon=await couponSchema.findByIdAndUpdate(couponID,{isActive:false})

        if(coupon){
            return res.status(200).json({message:"Coupon blocked successfully"})
        }else{
            return res.status(403).json({error:"cannot block the coupon please try again later" })
        }
        
    } catch (err) {
        console.log(`Error while blocking the coupon ${err}`);
        return res.status(403).json({error:"cannot block the coupon please try again later" })
    }
}


// unblock the coupon using fetch
const unBlockCoupon=async(req,res)=>{
    try {
        const couponID=req.params.id;

        if(!couponID){
            return res.status(404).json({error:"Cannot unblock the coupon right now please try again later"})
        }
        const coupon=await couponSchema.findByIdAndUpdate(couponID,{isActive:true})

        if(coupon){
            return res.status(200).json({message:"Coupon unblocked successfully"})
        }else{
            return res.status(403).json({error:"cannot unblock the coupon please try again later" })
        }
        
        
    } catch (err) {
        console.log(`Error while unblocking the coupon ${err}`);
        return res.status(403).json({error:"cannot unblock the coupon please try again later" })
    }
}



// delete the coupon using fetch
const deleteCoupon=async(req,res)=>{
    try {

        const couponID=req.params.id;

        if(!couponID){
            return res.status(404).json({error:"Cannot delete the coupon right now please try again later"})
        }

        const coupon=await couponSchema.findByIdAndDelete(couponID)

        if(coupon){
            return res.status(200).json({message:"Coupon deleted successfully"})
        }else{
            return res.status(403).json({error:"cannot delete the coupon please try again later" })
        }
        
        
    } catch (err) {
        console.log(`Error on deleting the coupon ${err}`);
        return res.status(403).json({error:"cannot delete the coupon please try again later" })
    }
}

module.exports = {
    coupons,
    addCoupon,
    editCoupon,
    blockCoupon,
    unBlockCoupon,
    deleteCoupon
}