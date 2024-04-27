const express=require('express')
const admin=express.Router();
const adminController=require('../controller/adminController')


admin.get('/login',adminController.login);
admin.post('/login',adminController.loginPost);
admin.get('/dashboard',adminController.dashboard);
admin.get('/products',adminController.products);
admin.get('/user',adminController.users);
admin.get('/orders',adminController.order);
admin.get('/coupons',adminController.coupons);
admin.get('/logout',adminController.logout);

module.exports=admin;