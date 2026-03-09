let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')

module.exports = {
    CreateAnUser: async function (username, password, email, role,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl: avatarUrl,
            fullName: fullName,
            status: status,
            loginCount: loginCount
        })
        await newUser.save();
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username: username });
        if (!getUser) {
            return false;
        }
        
        // Verify password with bcrypt
        let isValidPassword = bcrypt.compareSync(password, getUser.password);
        if (!isValidPassword) {
            return false;
        }
        
        return getUser;
    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted:false
        }).populate('role')
    },
    ChangePassword: async function (userId, oldPassword, newPassword) {
        // Find user
        let user = await userModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        
        // Verify old password
        let isValidPassword = bcrypt.compareSync(oldPassword, user.password);
        if (!isValidPassword) {
            throw new Error("Old password is incorrect");
        }
        
        // Update with new password (will be auto-hashed by pre-save hook)
        user.password = newPassword;
        await user.save();
        
        return { message: "Password changed successfully" };
    }
}