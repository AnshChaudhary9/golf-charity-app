const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/golf-charity';

async function seedAdmin() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected ✅');

  const adminEmail = 'admin@golf.com';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await mongoose.connection.db.collection('users').findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log('Admin user already exists. Updating role to Admin...');
    await mongoose.connection.db.collection('users').updateOne(
      { email: adminEmail },
      { $set: { role: 'Admin' } }
    );
  } else {
    console.log('Creating new Admin user...');
    await mongoose.connection.db.collection('users').insertOne({
      name: 'Platform Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log('\n--- ADMIN CREDENTIALS ---');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('-------------------------\n');

  await mongoose.disconnect();
  console.log('Done ✅');
}

seedAdmin().catch(err => {
  console.error('Error seeding admin:', err);
  process.exit(1);
});
