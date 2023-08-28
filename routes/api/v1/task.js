const express = require('express');
const router = express.Router();
const helper = require(__class_dir + '/helper.class.js');
const m$task = require(__module_dir + '/task.module.js');
const authenticateToken = require('../../../middlewares/auth');

router.post('/', authenticateToken, async function (req, res, next) {
    const userId = req.user.userId; // Mengambil user_id dari token JWT
    const addTask = await m$task.addTask(userId, req.body);
    helper.sendResponse(res, addTask);
});

router.get('/my-tasks', authenticateToken, async function (req, res, next) {
    const userId = req.user.userId;
    const tasks = await m$task.getTasks(userId);
    helper.sendResponse(res, tasks);
});

router.put('/:taskId', authenticateToken, async function (req, res, next) {
    const userId = req.user.userId;
    const taskId = req.params.taskId;
    const updatedData = req.body;
    const updateTaskResult = await m$task.updateTask(userId, taskId, updatedData);
    helper.sendResponse(res, updateTaskResult);
});

router.delete('/:taskId', authenticateToken, async function (req, res, next) {
    const userId = req.user.userId;
    const taskId = req.params.taskId;
    const deleteTaskResult = await m$task.deleteTask(userId, taskId);
    helper.sendResponse(res, deleteTaskResult);
});

// API untuk register
router.post('/register', async function (req, res, next) {
    const { username, password } = req.body;
    const registerResult = await m$task.registerUser(username, password);
    helper.sendResponse(res, registerResult);
});

// API untuk login
router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;
    const loginResult = await m$task.loginUser(username, password);
    helper.sendResponse(res, loginResult);
});

module.exports = router;