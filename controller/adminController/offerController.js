const offerSchema = require("../../model/offerSchema");
const productSchema=require('../../model/productSchema')
const categorySchema=require('../../model/categorySchema')




// render the offer page
const offerRender=async(req,res)=>{
    try {

        // get the offer details
        const offer=await offerSchema.find().sort({createdAt:-1})

        // get the products details
        const product=await productSchema.find({isActive:true}).sort({createdAt:-1})


        // get category details
        const category=await categorySchema.find({isActive:true}).sort({createdAt:-1})


        res.render('admin/offer',{
            title:"Offer Management",
            alertMessage:req.flash('errorMessage'),
            offer,
            product,
            category,
        })
        
    } catch (err) {
        console.log(`Error on rendering the offer page ${err}`);
    }
}



// add offer 
const addOffer=async(req,res)=>{
    try {
        
    } catch (err) {
        console.log(`Error on adding offer ${err}`);
    }
}

module.exports={
    offerRender,
}