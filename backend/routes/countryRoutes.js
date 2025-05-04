// backend/routes/country.js
import express from 'express';
import {
  getAllCountries,
  getCountryByName,
  getCountriesByRegion,
  getCountriesByLanguage,
  getCountryByCode,
  getCountriesByCodes,
  getCountriesByCurrency,
  getCountriesByDemonym,
  getCountriesByCapital,
  getCountriesBySubregion,
  getCountriesByTranslation,
} from '../controllers/countryController.js';

import { protect } from '../middleware/authMiddleware.js'; // protect routes

const router = express.Router();

// Public Routes (Optional: You could make them public)
// Or Private Routes (Recommended: Only after Login)

// ✅ Protected Route Examples

router.get('/all', protect, getAllCountries);
router.get('/name/:name', protect, getCountryByName);
router.get('/region/:region', protect, getCountriesByRegion);
router.get('/language/:language', protect, getCountriesByLanguage);
router.get('/codes', protect, getCountriesByCodes); // ?codes=est,no,pe
router.get('/currency/:currency', protect, getCountriesByCurrency);
router.get('/demonym/:demonym', protect, getCountriesByDemonym);
router.get('/capital/:capital', protect, getCountriesByCapital);
router.get('/code/:code', protect, getCountryByCode);
router.get('/subregion/:subregion', protect, getCountriesBySubregion);
router.get('/translation/:translation', protect, getCountriesByTranslation);

export default router;
