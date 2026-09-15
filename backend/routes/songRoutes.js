const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// GET /api/songs -> Lấy danh sách bài hát
router.get('/', songController.getAllSongs);

module.exports = router;
