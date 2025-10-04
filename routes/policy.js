const express = require('express');
const router = express.Router();
const {
  searchPolicyByUsername,
  getAggregatedPoliciesByUser
} = require('../controllers/policyController');

router.get('/search', searchPolicyByUsername);
router.get('/aggregated', getAggregatedPoliciesByUser);

module.exports = router;