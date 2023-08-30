var express = require('express');
const { getAll, createOne, getOne, updateById, deleteUser, getUsersApi } = require('../controllers/users.controller');
var router = express.Router();

/* GET users listing. */
router.get('/', getAll);
router.post('/api', createOne);
router.get('/api/:userId', getOne);
router.post('/api/update/:userId', updateById);
router.delete('/api/delete/:userId', deleteUser);
router.get('/api', getUsersApi);


module.exports = router;
