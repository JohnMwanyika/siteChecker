// const { Person } = require('../models');
const { Website, SiteStatus, User: Person, Team, Member, Monitor } = require('../models/index.js');
const { createDefaultTeam } = require('../models/team.model.js');


module.exports = {
    getAll: async (req, res) => {
        try {
            console.log('Getting all users...')
            const allUsers = await Person.findAll({
                include: [
                    { model: Monitor, include: { model: Team, include: { model: Member } } },
                    { model: Website },
                    { model: Team },
                    { model: Member },
                ]
            });
            if (allUsers.length == 0) {
                res.json({ status: "success", data: "No users found" });
                return;
            }
            // console.log(Person);
            // res.json(allUsers);
            res.render('users', { status: 'success', data: allUsers });
        } catch (error) {
            res.json({ message: { type: 'error', info: error.message } });
        }
    },
    createOne: async (req, res) => {
        const { firstName, lastName, email, phone } = req.body;
        const data = { firstName, lastName, email, phone };

        try {
            const existing = await Person.findOne({ where: { email } });

            if (existing) {
                return res.json({ status: 'warning', data: existing, msg: 'A user with similar email already exists, try another email' });
            }

            const newUser = await Person.create(data);

            if (!newUser) {
                return res.json({ status: 'warning', data: '', msg: 'An error occured while creating user please try again' });
            }

            const defaultTeamResponse = await createDefaultTeam(newUser.id);

            res.json({ status: 'success', data: newUser, msg: `${newUser.firstName}, has been created successfully` });
        } catch (error) {
            res.json({ status: 'error', data: '', msg: `An error occured while creating user account-${error.message}` });
        }
    },
    getOne: async (req, res) => {
        const { userId } = req.params;
        try {
            const user = await Person.findByPk(userId, {
                include: [
                    { model: Monitor, include: { model: Team, include: { model: Member } } },
                    { model: Website },
                    { model: Team },
                    { model: Member },
                ]
            })
            if (!user) {
                return res.json({ status: 'warning', data: '', msg: `User with id ${userId} is not found or has been removed` });
            }

            res.json({ status: 'success', data: user, msg: 'User has been found' });
        } catch (error) {
            res.json({ status: 'error', data: '', msg: `An error occured while retrieving this user-${error.message}` });
        }
    },
    updateById: async (req, res) => {
        const { userId } = req.params;
        const { name, age, gender, address } = req.body;
        const data = { name, age, gender, address }

        try {
            const user = await Person.findByPk(userId);

            if (!user) {
                return res.json({ status: 'warning', msg: `No user with id ${userId}` });
            }

            await Person.update(data, { where: { id: userId } });
            res.json({ status: 'success', data: '', msg: `${user.firstName} has been updated successfully` });

        } catch (error) {
            res.json({ status: 'error', data: '', msg: `An error occured while updating user-${error.message}` });
        }
    },
    deleteUser: async (req, res) => {
        const { userId } = req.params;

        try {
            const user = await Person.findByPk(userId);

            if (!user) {
                return res.json({ status: 'warning', msg: `No user with id ${userId}` });
            }

            await Person.destroy({ where: { id: userId } });

            res.json({ status: 'success', data: '', msg: 'User deleted successfully' });

        } catch (error) {
            res.json({ status: 'error', data: '', msg: `An error occured while deleting user-${error.message}` });
        }

    },
    getUsersApi: async (req, res) => {
        try {
            console.log('Getting all users...')
            const allUsers = await Person.findAll({
                include: [
                    { model: Monitor, include: { model: Team, include: { model: Member } } },
                    { model: Website },
                    { model: Team },
                    { model: Member },
                ]
            });
            if (allUsers.length == 0) {
                res.json({ status: "success", data: "No users found" });
                return;
            }
            res.json({ status: 'success', data: allUsers });
        } catch (error) {
            res.json({ status: 'error', data: '', msg: `An error occured while fetching users -${error.message}` });
        }
    }
}