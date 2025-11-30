import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list-db';
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 URI:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔗 Ready State:', conn.connection.readyState);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error(' MongoDB Connection Failed:');
    console.error(' Error:', error.message);
    console.log('Make sure MongoDB is running:');
    console.log('   - Local: mongod');
    console.log('   - Or update MONGODB_URI in .env file');
    process.exit(1);
  }
};

testConnection();
