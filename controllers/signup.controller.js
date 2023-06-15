const {
    User
} = require('../models/index');
const bcrypt = require('bcrypt');

module.exports = {
    signUp: async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            phone,
            roleId,
            password
        } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('this is the hashed password', hashedPassword);

        console.log(req.body);
        if (req.session.user.Role.name == 'Super Admin') {

            // const hashedPass = await bcrypt.hash('Welcome2023', saltRounds);

            return await User.findOne({
                where: {
                    email: email,
                }
            }).then((existingUser) => {
                console.log('Existing user is', existingUser);

                if (!existingUser) {
                    return createdUser = User.create({
                        firstName,
                        lastName,
                        email,
                        phone,
                        password: hashedPassword,
                        roleId: 2,
                        statusId: 1
                    })

                } else {
                    return res.redirect('/dashboard/users?error=user_exists');
                }
            }).then((createdUser) => {
                // console.log(createdUser)
                if (createdUser) {
                    res.redirect('/dashboard/users?success=user_created');
                }

            }).catch((error) => {
                res.json({
                    message: {
                        status: 'error',
                        info: error.message
                    }
                })
            });
        }
        // ############################ FEATURE ##################################
        // check if user is a registered county staff with an email address
        // const countyStaff = await Mail.findOne({
        //     where:{
        //         email:email
        //     }
        // })
        // if (!countyStaff){
        //     return res.redirect('/signup?error=not_member');
        // }
        // #######################################################################
        // check if user exists in the database with similar creadentials
        return await User.findOne({
            where: {
                email: email,
            }
        }).then((existingUser) => {
            console.log('Existing user is', existingUser);

            if (!existingUser) {
                return createdUser = User.create({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    roleId: 2,
                    statusId: 2
                })

            } else {
                return res.redirect('/signup?error=user_exists');
            }
        }).then((createdUser) => {
            console.log(createdUser)
            res.redirect('/login?success=user_created');
        }).catch((error) => {
            res.json({
                message: {
                    status: 'error',
                    info: error.message
                }
            })
        });
    },
}