const router = require("express").Router();
const passport = require("passport");

router.get('/login', (req, res) => {
    res.send('login', {user:req.user});
});

router.get('/logout', (req, res) => {
    res.send('logging out');
});

router.get('/google', passport.authenticate('google', {
    scope:['profile']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/availableFields/')
});

module.exports = router;