import express from 'express';
import { isAuth } from './middleware.js';
import { addAlbum, addSong, addThumbnail, deleteAlbum, deleteSong } from './controller.js';
import uploadFile from './middleware.js';

const router = express.Router();

router.post("/admin/album/new", isAuth, uploadFile, addAlbum);
router.post("/admin/song/new",isAuth,uploadFile,addSong);
router.post("/admin/song/:id",isAuth,uploadFile,addThumbnail);
router.delete("/admin/album/:id",isAuth,deleteAlbum)
router.delete("/admin/song/:id",isAuth,deleteSong);

export default router;