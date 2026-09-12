// backend/src/routes/infraRoutes.js
const express = require('express');
const router = express.Router();
const infraController = require('../controllers/infraController');

router.get('/', infraController.listar);

module.exports = router;
