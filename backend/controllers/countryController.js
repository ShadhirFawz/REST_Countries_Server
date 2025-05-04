// backend/controllers/countryController.js
import axios from 'axios';
import { trackRecentlyViewed } from './userController.js';

/**
 * @desc   Get all countries
 * @route  GET /api/countries/all
 * @access  Private
 */
export const getAllCountries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    const response = await axios.get(`https://restcountries.com/v3.1/independent?status=true`);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = response.data.slice(startIndex, endIndex);
    
    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all countries', error: error.message });
  }
};

/**
 * @desc   Get country by name
 * @route  GET /api/countries/name/:name
 * @access  Private
 */
export const getCountryByName = async (req, res) => {
  const { name } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: `Country "${name}" not found`, error: error.message });
  }
};

/**
 * @desc   Get countries by region
 * @route  GET /api/countries/region/:region
 * @access  Private
 */
export const getCountriesByRegion = async (req, res) => {
  const { region } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/region/${region}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: `Error fetching countries from region "${region}"`, error: error.message });
  }
};

/**
 * @desc   Get countries by language
 * @route  GET /api/countries/language/:language
 * @access  Private
 */
export const getCountriesByLanguage = async (req, res) => {
  const { language } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/lang/${language}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: `Error fetching countries speaking "${language}"`, error: error.message });
  }
};

/**
 * @desc   Get country by code
 * @route  GET /api/countries/code/:code
 * @access  Private
 */
export const getCountryByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
    const country = response.data[0];

    // ✅ Automatically log the viewed country
    if (req.user?.id) {
      await trackRecentlyViewed(req.user.id, code.toUpperCase());
    }

    res.json(country);
  } catch (error) {
    res.status(404).json({ message: 'Country not found' });
  }
};

/**
 * @desc   Get Multiple countries by codes
 * @route  GET /api/countries/codes?codes=est,pe,no
 * @access  Private
 */
export const getCountriesByCodes = async (req, res) => {
  const { codes } = req.query; // example: ?codes=est,pe,no
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/alpha?codes=${codes}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching countries by codes', error: err.message });
  }
};


/**
 * @desc   Get countries by currency
 * @route  GET /api/countries/currency/:currency
 * @access  Private
 */
export const getCountriesByCurrency = async (req, res) => {
  const { currency } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/currency/${currency}`);
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: 'Currency not found', error: err.message });
  }
};

/**
 * @desc   Get countries by demonym (search by how a citizen is called.)
 * @route  GET /api/countries/demonym/:demonym
 * @access  Private
 */
export const getCountriesByDemonym = async (req, res) => {
  const { demonym } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/demonym/${demonym}`);
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: 'Demonym not found', error: err.message });
  }
};

/**
 * @desc   Get countries by capital
 * @route  GET /api/countries/capital/:capital
 * @access  Private
 */
export const getCountriesByCapital = async (req, res) => {
  const { capital } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/capital/${capital}`);
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: 'Capital not found', error: err.message });
  }
};

/**
 * @desc   Get countries by subregion
 * @route  GET /api/countries/subregion/:subregion
 * @access  Private
 */
export const getCountriesBySubregion = async (req, res) => {
  const { subregion } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/subregion/${subregion}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching by subregion', error: error.message });
  }
};

/**
 * @desc   Get countries by translation
 * @route  GET /api/countries/translation/:translation
 * @access  Private
 */
export const getCountriesByTranslation = async (req, res) => {
  const { translation } = req.params;
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/translation/${translation}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching by translation', error: error.message });
  }
};


