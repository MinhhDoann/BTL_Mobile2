const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

// GET /api/library -> Lấy tổng quan thư viện
router.get('/', libraryController.getUserLibrary);

// GET /api/library/favorites -> Lấy bài hát yêu thích
router.get('/favorites', libraryController.getFavoriteSongs);

// GET /api/library/playlist/:playlistId -> Chi tiết playlist & bài hát
router.get('/playlist/:playlistId', libraryController.getPlaylistDetails);

// POST /api/library/playlist -> Tạo playlist mới
router.post('/playlist', libraryController.createPlaylist);

module.exports = router;
