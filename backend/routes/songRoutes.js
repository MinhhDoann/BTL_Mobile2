const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// GET /api/songs -> Lấy tất cả bài hát từ bảng songs ở MySQL
router.get('/', songController.getAllSongs);

// GET /api/songs/:id -> Lấy chi tiết 1 bài hát
router.get('/:id', songController.getSongById);

// POST /api/songs/:id/play -> Tăng lượt phát cho bài hát
router.post('/:id/play', songController.incrementPlayCount);

module.exports = router;
