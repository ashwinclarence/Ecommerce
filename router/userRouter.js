const express=require('express')
const user=express.Router();
const userController=require('../controller/userController')

user.get('/login',userController.login)
user.post('/login',userController.loginPost)
user.get('/home',userController.home)

module.exports=user;