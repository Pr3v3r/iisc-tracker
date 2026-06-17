const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} = require('../controllers/collegeController');

router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.post('/', createCollege);
router.put('/:id', updateCollege);
router.delete('/:id', deleteCollege);

module.exports = router;