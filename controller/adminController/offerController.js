const offerRender=async(req,res)=>{
    try {
        res.render('admin/offer',{title:"Offer Management",alertMessage:req.flash('errorMessage')})
        
    } catch (err) {
        console.log(`Error on rendering the offer page ${err}`);
    }
}

module.exports={
    offerRender,
}