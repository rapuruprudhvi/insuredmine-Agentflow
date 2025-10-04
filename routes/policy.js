const express = require('express');
const router = express.Router();
const {
  searchPolicyByUsername,
  getAggregatedPoliciesByUser
} = require('../controllers/policyController');

// Search policy by username
router.get('/search', searchPolicyByUsername);

// Get aggregated policies by user
router.get('/aggregated', getAggregatedPoliciesByUser);

module.exports = router;