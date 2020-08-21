const express = require('express')
const authModel = require('../models/authModel')
const router = express.Router();
const path = require('path');
var multer  = require('multer');
const feedsData = require('../schema/feedsSchema');

var uppic = null
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        global.uppic = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, global.uppic );
    }
});
var imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

router.route('/register').get(authModel.getRegisterPage).post(authModel.registerUser)
router.route('/login').get(authModel.getLoginPage).post(authModel.loginUser);
router.route('/dashboard').get(authModel.checkAuthenticated, authModel.getDashboardPage);
router.route('/logout').post(authModel.logoutUser);

router.route('/submit').post(authModel.checkAuthenticated, authModel.submitProfile);
router.route('/selection').get(authModel.checkAuthenticated, authModel.getSelectionPage);
router.route('/employer').get(authModel.checkAuthenticated, authModel.getJobpostPage);
router.route('/profile').get(authModel.checkAuthenticated, authModel.getProfile);
router.route('/jobpost').post(authModel.checkAuthenticated, authModel.submitJobData);

router.route('/JobResume/:id').get(authModel.checkAuthenticated, authModel.sendcv);

router.route('/feeds').get(authModel.checkAuthenticated, authModel.sendFeeds);
router.route('/feed/delete/:id').post(authModel.checkAuthenticated, authModel.deleteFeed);
router.route('/feed/upload/').post(authModel.checkAuthenticated, upload.single('uppic'), (req,res,next)=>{
    const {content, linkpic} = req.body
    uppic = global.uppic
    author = req.user.username
    time = new Date();
    const timesort2 = Date.now();
    feedsData({
        author,time,timesort2,content, linkpic, uppic
    }).save((err, data) => {
        if (err) throw err;
        res.redirect('/api/user/feeds/');
    });
});

router.route('/candidates').get(authModel.checkAuthenticated, authModel.getCandidates);
router.route('/candidates/search').post(authModel.checkAuthenticated, authModel.candsearch);

router.route('/jobs').get(authModel.checkAuthenticated, authModel.getJobs);
router.route('/jobs/search/').post(authModel.checkAuthenticated, authModel.searchJob);

router.route('/postedjobs').get(authModel.checkAuthenticated, authModel.getPostedJobs);
router.route('/delete/:id').post(authModel.checkAuthenticated, authModel.deleteJob);
router.route('/apply/:id').post(authModel.checkAuthenticated, authModel.jobApply);

module.exports = router;