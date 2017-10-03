const express = require('express');
const router = express.Router();

router.get('/ping', (req, res, next) => {
    res.json({text: 'Pong'});
});

module.exports = router;