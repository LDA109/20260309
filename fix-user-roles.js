// Script to fix user roles in database
const mongoose = require('mongoose');
const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');

async function fixUserRoles() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C2');
        console.log('Connected to MongoDB\n');

        // Get all roles
        const roles = await roleModel.find({ isDeleted: false });
        console.log('📋 Available roles:');
        roles.forEach(role => {
            console.log(`   - ${role.name}: ${role._id}`);
        });
        console.log();

        // Get all users with populated roles
        const users = await userModel.find({ isDeleted: false }).populate('role');
        
        console.log('👥 Current users and their roles:');
        for (const user of users) {
            console.log(`   - ${user.username} (${user.email})`);
            console.log(`     Role ID: ${user.role}`);
            if (user.role && user.role.name) {
                console.log(`     Role Name: ${user.role.name}`);
            } else {
                console.log(`     ⚠️  Role NOT FOUND in database!`);
            }
            console.log();
        }

        // Find ADMIN role
        const adminRole = await roleModel.findOne({ name: 'ADMIN' });
        
        // Update user "admin" to have ADMIN role
        const adminUser = await userModel.findOne({ username: 'admin' });
        if (adminUser && adminRole) {
            adminUser.role = adminRole._id;
            await adminUser.save();
            console.log('✅ Fixed: User "admin" now has ADMIN role');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixUserRoles();
