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
        const data = { firstName, lastName, email, phone }
        const newUser = await Person.create(data)
            .then(async (newUser) => {
                const results = await createDefaultTeam(newUser.id);
                console.log('created default team', results);
                return newUser;
            })
            .then((newUser) => {
                res.json({ status: 'success', data: newUser });
                // res.send(`User ${newUser.name} created successfully id is ${newUser.id}`)
            })
            .catch((error) => {
                res.json({ error: error.message })
            })
    },
    getOne: async (req, res) => {
        const { id } = req.params;
        const user = await Person.findByPk(id)
            .then((user) => {
                if (!user) {
                    res.json({ status: 'error', message: `No user with id ${id}` })
                    return;
                }
                console.log(user);
                res.json({ status: 'success', data: user });
            })
    },
    updateById: async (req, res) => {
        const { id } = req.params;
        const { name, age, gender, address } = req.body;
        const data = { name, age, gender, address }
        const user = await Person.findByPk(id);
        if (!user) {
            res.json({ status: 'error', message: `No user with id ${id}` })
            return;
        }
        const updatedUser = await Person.update(
            { name, age, gender, address }, {
            where: {
                id: id
            }
        })
            .then((updatedUser) => {
                console.log(updatedUser);
                res.json({ status: 'success', data: updatedUser })
            })
            .catch((err) => {
                res.json({ status: 'error', message: err.message })
            })
    },
    deleteUser: async (req, res) => {
        const { id } = req.params;
        const user = await Person.findByPk(id)
            .then((user) => {
                if (!user) {
                    res.json({ status: 'error', message: `No user with id ${id}` })
                    return;
                }
                return user;
            }).then(async (user) => {
                const deletedUser = await Person.destroy({
                    where: {
                        id: user.id,
                    }
                })
                return deletedUser;
            })
            .then((data) => {
                console.log(data);
                res.json({ status: 'success', data: data })
            })
            .catch((err) => {
                res.json({ status: 'error', message: err.message })
            })


    }
}