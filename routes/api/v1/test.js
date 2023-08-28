const express = require('express');
const router = express.Router();
const helper = require(__class_dir + '/helper.class.js');

router.get('/', async function (req, res, next) {
    const list = [{
        nama: "Test",
        nik: "341000000000002"
    },]
    helper.sendResponse(res, list);
});

module.exports = router;
