const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getSimilar
} = require('../controllers/companyController');

router.use(authMiddleware);

router.get('/', getCompanies);
router.post('/', createCompany);
router.get('/similar/:name', getSimilar);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;

