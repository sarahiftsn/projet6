const express = require ('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Auth middleware
const upload = require('../middleware/multer-config');
const resizeImage = require('../middleware/sharp');

const bookCtrl = require('../controllers/books');

router.post('/', auth, upload.single('image'), resizeImage, bookCtrl.createBook);
router.put('/:id', auth, upload.single('image'), resizeImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBook);

module.exports = router;