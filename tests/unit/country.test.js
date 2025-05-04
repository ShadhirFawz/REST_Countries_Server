// tests/unit/countryController.test.js
const { getCountryByCode } = require('../../controllers/countryController');
const User = require('../../model/User');
const axios = require('axios');

jest.mock('axios');
jest.mock('../../model/User');
jest.mock('../../controllers/countryController', () => ({
  trackRecentlyViewed: jest.fn(),
}));

describe('getCountryByCode', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { code: 'EE' },
      user: { id: 'user123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return country data and track view', async () => {
    const mockCountry = { name: { common: 'Estonia' }, cca2: 'EE' };
    axios.get.mockResolvedValue({ data: [mockCountry] });

    await getCountryByCode(req, res);

    expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/alpha/EE');
    expect(res.json).toHaveBeenCalledWith(mockCountry);
    expect(trackRecentlyViewed).toHaveBeenCalledWith('user123', 'EE');
  });

  it('should return 404 if country not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });

    await getCountryByCode(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Country not found' });
  });
});