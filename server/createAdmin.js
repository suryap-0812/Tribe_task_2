import sequelize from './db.js';
import { User } from './models/associations.js';
import 'dotenv/config';

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');

        const adminEmail = 'adminmain@admin.pom';
        const adminPassword = 'adminmain123';

        // Check if admin already exists
        let admin = await User.findOne({ where: { email: adminEmail } });

        if (admin) {
            console.log('Admin already exists. Updating permissions...');
            admin.isAdmin = true;
            await admin.save();
            console.log('✅ Admin permissions updated');
        } else {
            console.log('Creating new Admin user...');
            admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                isAdmin: true
            });
            console.log('✅ Admin user created successfully');
        }

        await sequelize.close();
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
