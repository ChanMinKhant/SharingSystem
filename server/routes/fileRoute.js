const router = require('express').Router();
const { multiUpload, singleUpload } = require('../middlewares/uploadFile');
const { verifyJWT } = require('../middlewares/verifyJWT');
const { protect } = require('../middlewares/protectRoute');
const {
  uploadFile,
  getAllFiles,
  updateFile,
  deleteFile,
} = require('../controllers/fileController');

//use verifyJWT to verify token
//use protect to verify user
//use multiUpload to upload multiple files
//use singleUpload to upload single file
//use uploadFile to upload file

router.use(verifyJWT);
router.route('/upload').post(singleUpload('file'), uploadFile);
// router.use(protect);
router.route('/').get(getAllFiles);
router.route('/:shortId').patch(updateFile).delete(deleteFile);

module.exports = router;
