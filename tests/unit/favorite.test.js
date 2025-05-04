// tests/unit/favoriteController.test.js
const { addFavorite } = require('../../controllers/favoriteController');
const User = require('../../model/User');

jest.mock('../../model/User');

describe('addFavorite', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      body: { code: 'EE', name: 'Estonia', flag: '🇪🇪' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should add country to favorites', async () => {
    const mockUser = {
      _id: 'user123',
      favorites: [],
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(mockUser);

    await addFavorite(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(mockUser.favorites).toContainEqual({
      code: 'EE',
      name: 'Estonia',
      flag: '🇪🇪',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if country already in favorites', async () => {
    const mockUser = {
      _id: 'user123',
      favorites: [{ code: 'EE', name: 'Estonia' }],
      save: jest.fn(),
    };
    User.findById.mockResolvedValue(mockUser);

    await addFavorite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Country already in favorites',
    });
  });
});