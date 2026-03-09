var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler.js')
let roleModel = require('../schemas/roles');

/* GET home page. */
//localhost:3000
router.post('/register', async function (req, res, next) {
    try {
        // Get USER role from database (default role for registration)
        let userRole = await roleModel.findOne({ name: 'USER' });
        if (!userRole) {
            return res.status(500).send({ message: "USER role not found. Please create it first." });
        }
        
        let newUser = await userController.CreateAnUser(
            req.body.username,
            req.body.password,
            req.body.email,
            userRole._id
        )
        res.send({
            message: "dang ki thanh cong",
            userId: newUser._id
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
});
router.post('/login', async function (req, res, next) {
    let result = await userController.QueryByUserNameAndPassword(
        req.body.username, req.body.password
    )
    if (result) {
        let token = jwt.sign({
            id: result.id
        }, 'secret', {
            expiresIn: '1h'
        })
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        });
        res.send(token)
    } else {
        res.status(404).send({ message: "sai THONG TIN DANG NHAP" })
    }

});
router.get('/me', checkLogin, async function (req, res, next) {
    console.log(req.userId);
    let getUser = await userController.FindUserById(req.userId);
    res.send(getUser);
})
router.post('/logout', checkLogin, function (req, res, next) {
    res.cookie('token', null, {
        maxAge: 0,
        httpOnly: true
    })
    res.send("da logout ")
})

router.post('/change-password', checkLogin, async function (req, res, next) {
    try {
        let { oldPassword, newPassword } = req.body;
        
        // Validate input
        if (!oldPassword || !newPassword) {
            return res.status(400).send({ 
                message: "oldPassword and newPassword are required" 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).send({ 
                message: "New password must be at least 6 characters" 
            });
        }
        
        // Change password
        let result = await userController.ChangePassword(
            req.userId, 
            oldPassword, 
            newPassword
        );
        
        res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})



module.exports = router;
