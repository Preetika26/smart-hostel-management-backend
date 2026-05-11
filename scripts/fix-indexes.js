const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);

    const collection = mongoose.connection.collection('rooms');
    
    console.log('Fetching existing indexes for rooms...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    for (const idx of indexes) {
      // If it's a unique index on JUST roomNumber, drop it
      if (idx.name !== '_id_' && idx.key.roomNumber && Object.keys(idx.key).length === 1) {
        console.log(`Dropping index: ${idx.name}`);
        await collection.dropIndex(idx.name);
        console.log(`Index ${idx.name} dropped`);
      }
    }

    console.log('Ensuring compound index { roomNumber: 1, block: 1 }...');
    await collection.createIndex({ roomNumber: 1, block: 1 }, { unique: true });
    console.log('Compound index verified');

    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
