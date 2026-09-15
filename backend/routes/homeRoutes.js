const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// GET /api/home-data -> Lấy dữ liệu trang chủ
router.get('/', homeController.getHomeData);

module.exports = router;
