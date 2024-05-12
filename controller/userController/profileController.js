const profileView=(req,res)=>{
    try {
        res.render('user/profile',{title:"Profile",alertMessage:req.flash('errorMessage'),user:req.session.user})
    } catch (err) {
        console.log(`Error during profile page render ${err}`);
    }
}

module.exports={
    profileView
}