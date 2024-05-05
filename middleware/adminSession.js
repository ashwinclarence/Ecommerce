

    // this function checks the session of the admin and if admin not exist then redirect to login page
    
    function checkAdminSession(req,res,next){
        if(req.session.admin){
            next()
        }else{
            res.redirect('/admin/login')
        }
    }

    module.exports=checkAdminSession;