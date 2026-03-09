// Script to update user roles in database
const mongoose = require('mongoose');
const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');

async function seedAdminAndModerator() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C2');
        console.log('Connected to MongoDB');

        // Get roles
        const adminRole = await roleModel.findOne({ name: 'ADMIN' });
        const modRole = await roleModel.findOne({ name: 'MODERATOR' });

        if (!adminRole || !modRole) {
            console.error('ADMIN or MODERATOR role not found!');
            process.exit(1);
        }

        // Update superadmin to ADMIN role
        const superadmin = await userModel.findOneAndUpdate(
            { username: 'superadmin' },
            { role: adminRole._id },
            { new: true }
        );

        // Update moderator to MODERATOR role
        const moderator = await userModel.findOneAndUpdate(
            { username: 'moderator' },
            { role: modRole._id },
            { new: true }
        );

        console.log('✅ superadmin updated with ADMIN role:', superadmin ? 'Success' : 'Not found');
        console.log('✅ moderator updated with MODERATOR role:', moderator ? 'Success' : 'Not found');

        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedAdminAndModerator();
