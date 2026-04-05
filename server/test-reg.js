import { User } from './models/associations.js';
import sequelize from './db.js';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connected');
        const user = await User.create({
            name: 'Testy',
            email: `test_${Date.now()}@test.com`,
            password: 'password123'
        });
        console.log('Created user:', user.toJSON());
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
test();
