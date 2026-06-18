const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} = require('../controllers/collegeController');

router.use(protect);

router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.post('/', createCollege);
router.put('/:id', updateCollege);
router.delete('/:id', deleteCollege);

module.exports = router;