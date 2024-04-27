// render the login page for admin only if the admin's session is not present 
const login=(req,res)=>{
    if(req.session.admin){
        res.redirect('/admin/dashboard')
    }else{
        res.render('admin/login',{title:"Admin Login"})
    }
}


// login with admin's username and password
const loginPost=(req,res)=>{
    if(req.body.username===process.env.ADMIN_USERNAME && req.body.password===process.env.ADMIN_PASSWORD){
        req.session.admin=req.body.username;
        res.redirect('/admin/dashboard')
    }else{
        res.render('admin/login',{title:"Admin Login",errorStatus:true,errorMessage:"Invalid username or password. Please try again!"})
    }
}


// rendering the dashboard page
const dashboard=(req,res)=>{
    if(req.session.admin){
        res.render('admin/dashboard',{title:"Admin Dashboard"})
    }else{
        res.redirect('/admin/login')
    }
}




// render the product page
const products=(req,res)=>{
    if(req.session.admin){
        res.render('admin/products',{title:"Product list"})
    }else{
        res.redirect('/admin/login')
    }
}


// render the users page 
const users=(req,res)=>{
    if(req.session.admin){
        res.render('admin/user',{title:"users list"})
    }else{
        res.redirect('/admin/login')
    }
}



// render the order page 
const order=(req,res)=>{
    if(req.session.admin){
        res.render('admin/order',{title:"Order list"})
    }else{
        res.redirect('/admin/login')
    }
}



// render the coupons page 
const coupons=(req,res)=>{
    if(req.session.admin){
        res.render('admin/coupons',{title:"Coupons"})
    }else{
        res.redirect('/admin/login')
    }
}



// logout the admin session and redirect to the login page
const logout=(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(`Error occurred while destroying the session ${err}`)
        }else{
            res.redirect('/admin/login')
        }
    })
}

module.exports={login, dashboard, products, users, order, coupons, loginPost, logout}