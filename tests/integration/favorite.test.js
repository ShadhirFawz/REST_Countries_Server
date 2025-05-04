const request = require('supertest');
const { app, server } = require('../../app'); // Import both app and server
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Favorite Controller Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds
    
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Create a test user with unique credentials
    testUser = await User.create({
      username: 'testuser-favorite',
      email: 'test-favorite@example.com',
      password: 'password123',
      favorites: []
    });

    // Generate JWT token
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
  }, 30000); // 30-second timeout for the beforeAll hook

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    server.close(); // Close the server
  }, 30000); // 30-second timeout for the afterAll hook

  describe('POST /api/favorites', () => {
    it('should add a country to favorites', async () => {
      const countryData = {
        code: 'EE',
        name: 'Estonia',
        flag: '🇪🇪'
      };

      const res = await request(server) // Use server instead of app
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(countryData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Added to favorites');
      
      // Verify the user was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.favorites).toHaveLength(1);
      expect(updatedUser.favorites[0].code).toBe('EE');
    });

    it('should return error if country already in favorites', async () => {
      // First add the country
      await User.findByIdAndUpdate(testUser._id, {
        $push: { favorites: { code: 'EE', name: 'Estonia' } }
      });

      const countryData = {
        code: 'EE',
        name: 'Estonia',
        flag: '🇪🇪'
      };

      const res = await request(server) // Use server instead of app
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(countryData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Country already in favorites');
    });
  });

  describe('DELETE /api/favorites/:code', () => {
    it('should remove a country from favorites', async () => {
      // First add a country to favorites
      await User.findByIdAndUpdate(testUser._id, {
        $push: { favorites: { code: 'FI', name: 'Finland' } }
      });

      const res = await request(server) // Use server instead of app
        .delete('/api/favorites/FI')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Removed from favorites');
      
      // Verify the user was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.favorites).toHaveLength(0);
    });

    it('should handle removing non-existent favorite', async () => {
      const res = await request(server) // Use server instead of app
        .delete('/api/favorites/XX')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200); // Still 200 since it's technically successful
    });
  });

  describe('GET /api/favorites', () => {
    it('should return all favorite countries', async () => {
      // Add some favorites first
      await User.findByIdAndUpdate(testUser._id, {
        favorites: [
          { code: 'EE', name: 'Estonia' },
          { code: 'FI', name: 'Finland' }
        ]
      });

      const res = await request(server) // Use server instead of app
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].code).toBe('EE');
    });

    it('should return empty array if no favorites', async () => {
      // Clear favorites
      await User.findByIdAndUpdate(testUser._id, { favorites: [] });

      const res = await request(server) // Use server instead of app
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(0);
    });
  });
});