import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'adminmain@admin.pom';
        const adminPassword = 'adminmain123';

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin already exists. Updating permissions...');
            admin.isAdmin = true;
            await admin.save();
            console.log('✅ Admin permissions updated');
        } else {
            console.log('Creating new Admin user...');
            admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                isAdmin: true
            });
            await admin.save();
            console.log('✅ Admin user created successfully');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
