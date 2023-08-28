const config = require(`${__config_dir}/app.config.json`);
const {debug} = config;
const mysql = new(require(`${__class_dir}/mariadb.class.js`))(config.db);
const Joi =  require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtSecretKey = "secret";

class _task{
    async addTask(userId, data) {
        try {
            const schema = Joi.object({
                item: Joi.string().required()
            });
            const validation = schema.validate(data);
            if (validation.error) {
                const errorDetails = validation.error.details.map((detail) => detail.message);
                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                };
            }

            const query = 'INSERT INTO tasks (user_id, item) VALUES (?, ?)';
            const result = await mysql.query(query, [userId, data.item]);

            if (result.affectedRows > 0) {
                return {
                    status: true,
                    message: 'Task added successfully'
                };
            } else {
                return {
                    status: false,
                    message: 'Unable to add task'
                };
            }
        } catch (error) {
            console.error('addTask Error: ', error);
            return {
                status: false,
                message: 'An error occurred while adding the task'
            };
        }
    }

    async getTasks(userId) {
        try {
            const query = 'SELECT * FROM tasks WHERE user_id = ?';
            const tasks = await mysql.query(query, [userId]);
            return {
                status: true,
                data: tasks
            };
        } catch (error) {
            if (debug) {
                console.error('getTasks Error: ', error);
            }
            return {
                status: false,
                error
            };
        }
    }
    

    async updateTask(userId, taskId, updatedData) {
        try {
            const schema = Joi.object({
                item: Joi.string().required()
            });
            const validation = schema.validate(updatedData);
            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message);
                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                };
            }

            const query = 'UPDATE tasks SET item = ?, updatedat = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
            const result = await mysql.query(query, [updatedData.item, taskId, userId]);
            if (result.affectedRows > 0) {
                return {
                    status: true,
                    message: 'Task updated successfully'
                };
            } else {
                return {
                    status: false,
                    message: 'Task not found or unable to update'
                };
            }
        } catch (error) {
            if (debug) {
                console.error('updateTask Error: ', error);
            }
            return {
                status: false,
                error
            };
        }
    }

    async deleteTask(userId, taskId) {
        try {
            const taskQuery = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
            const task = await mysql.query(taskQuery, [taskId, userId]);
    
            if (task.length === 0) {
                return {
                    status: false,
                    message: 'Task not found or unauthorized'
                };
            }
    
            const deleteQuery = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
            const result = await mysql.query(deleteQuery, [taskId, userId]);
    
            if (result.affectedRows > 0) {
                return {
                    status: true,
                    message: 'Task deleted successfully'
                };
            } else {
                return {
                    status: false,
                    message: 'Task not found or unable to delete'
                };
            }
        } catch (error) {
            console.error('deleteTask Error: ', error);
            return {
                status: false,
                message: 'An error occurred while deleting the task'
            };
        }
    }
    

    async registerUser(username, password) {
        try {
            const hash = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
            const result = await mysql.query(query, [username, hash]);

            if (result.affectedRows > 0) {
                return {
                    status: true,
                    message: 'User registered successfully'
                };
            } else {
                return {
                    status: false,
                    message: 'User registration failed'
                };
            }
        } catch (error) {
            if (debug) {
                console.error('registerUser Error: ', error);
            }
            return {
                status: false,
                error
            };
        }
    }

    async loginUser(username, password) {
        try {
            const query = 'SELECT * FROM users WHERE username = ?';
            const user = await mysql.query(query, [username]);
            const userId = user[0].id;

            if (user.length === 0) {
                return {
                    status: false,
                    message: 'User not found'
                };
            }

            const isPasswordMatch = await bcrypt.compare(password, user[0].password_hash);
            if (isPasswordMatch) {
                // const token = jwt.sign({ username }, jwtSecretKey);
                const token = jwt.sign({ userId }, jwtSecretKey, { expiresIn: '1h' });
                return {
                    status: true,
                    message: 'Login successful',
                    token
                };
            } else {
                return {
                    status: false,
                    message: 'Incorrect password'
                };
            }
        } catch (error) {
            if (debug) {
                console.error('loginUser Error: ', error);
            }
            return {
                status: false,
                error
            };
        }
    }

}

module.exports = new _task();
