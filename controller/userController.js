const login=(req,res)=>{
    if(req.session.user){
        res.redirect('/user/home')
    }else{
        res.render('user/login',{title:'User Login',loginError:false})
    }
}

const loginPost=(req,res)=>{
    if(req.body.username==='ashwin@123' && req.body.password==='123'){
        req.session.user=req.body.username
        res.redirect('/user/home')
    }else{
        res.render('user/login',{title:'User Login',loginError:true,errorMessage:'Invalid username or password'})
    }
}


const home=(req,res)=>{
    if(req.session.user){
        res.render('user/home',{title:'User Home'})
    }else{
        res.redirect('/user/login')
    }
}
const wishlist=(req,res)=>{
    if(req.session.user){
        res.render('user/wishlist',{title:"Wishlist"})
    }else{
        res.redirect('/user/login')
    }
}
const cart=(req,res)=>{
    if(req.session.user){
        res.render('user/cart',{title:"cart"})
    }else{
        res.redirect('/user/login')
    }
}
const signup=(req,res)=>{
    if(req.session.user){
        res.redirect('/user/home')
    }else{
        res.render('user/register',{title:"signup",registerError:false})
       
    }
}

module.exports={login,loginPost,home,wishlist,cart,signup}