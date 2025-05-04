// tests/integration/country.test.js
const request = require('supertest');
const { app, server } = require('../../app'); // Import both app and server
const axiosMock = require('axios');
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('axios');

describe('Country Controller Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    jest.setTimeout(30000);
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    testUser = await User.create({
      username: 'testuser-country',
      email: 'test-country@example.com',
      password: 'password123'
    });

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    server.close(); // Close the server
  }, 30000);

  describe('GET /api/countries/all', () => {
    it('should return paginated countries', async () => {
      const mockCountries = Array(10).fill().map((_, i) => ({
        name: { common: `Country ${i}` },
        cca2: `C${i}`
      }));

      axiosMock.get.mockResolvedValue({ data: mockCountries });

      const res = await request(server)
        .get('/api/countries/all?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(5);
      expect(res.body[0].name.common).toBe('Country 5');
    });

    it('should handle API errors', async () => {
      axiosMock.get.mockRejectedValue(new Error('API Error'));

      const res = await request(server)
        .get('/api/countries/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain('Error fetching all countries');
    });
  });

  describe('GET /api/countries/name/:name', () => {
    it('should return countries by name', async () => {
      const mockResponse = [{ name: { common: 'Estonia' }, cca2: 'EE' }];
      axiosMock.get.mockResolvedValue({ data: mockResponse });

      const res = await request(server)
        .get('/api/countries/name/estonia')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body[0].name.common).toBe('Estonia');
    });

    it('should return 404 for non-existent country', async () => {
      axiosMock.get.mockRejectedValue({ response: { status: 404 } });

      const res = await request(server)
        .get('/api/countries/name/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('GET /api/countries/region/:region', () => {
    it('should return countries by region', async () => {
      const mockResponse = [
        { name: { common: 'Estonia' }, region: 'Europe' },
        { name: { common: 'Finland' }, region: 'Europe' }
      ];
      axiosMock.get.mockResolvedValue({ data: mockResponse });

      const res = await request(server)
        .get('/api/countries/region/europe')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].region).toBe('Europe');
    });

    it('should handle region not found', async () => {
      axiosMock.get.mockRejectedValue(new Error('Region not found'));

      const res = await request(server)
        .get('/api/countries/region/unknown')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(500);
    });
  });

  describe('GET /api/countries/code/:code', () => {
    it('should return country by code and track view', async () => {
      const mockCountry = { name: { common: 'Estonia' }, cca2: 'EE' };
      axiosMock.get.mockResolvedValue({ data: [mockCountry] });

      const res = await request(server)
        .get('/api/countries/code/EE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name.common).toBe('Estonia');

      // Verify tracking occurred
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.recentlyViewed.some(v => v.countryCode === 'EE')).toBeTruthy();
    });

    it('should return 404 for invalid country code', async () => {
      axiosMock.get.mockRejectedValue({ response: { status: 404 } });

      const res = await request(server)
        .get('/api/countries/code/XX')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('GET /api/countries/codes', () => {
    it('should return multiple countries by codes', async () => {
      const mockResponse = [
        { name: { common: 'Estonia' }, cca2: 'EE' },
        { name: { common: 'Finland' }, cca2: 'FI' }
      ];
      axiosMock.get.mockResolvedValue({ data: mockResponse });

      const res = await request(server)
        .get('/api/countries/codes?codes=EE,FI')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
    });

    it('should handle invalid codes', async () => {
      axiosMock.get.mockRejectedValue(new Error('Invalid codes'));

      const res = await request(server)
        .get('/api/countries/codes?codes=XX,YY')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(500);
    });
  });

  // ... other describe blocks
});