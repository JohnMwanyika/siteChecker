const {
    User, Member,Team
} = require('../models/index');
const bcrypt = require('bcrypt');
const { createDefaultTeam } = require('../models/team.model');

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

        try {
            const existingUser = await User.findOne({ where: { email: email } });
            // if user exists with that email redirect with a message
            if (existingUser) {
                return res.redirect('/signup?error=user_exists');
            }

            const newUser = await User.create({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                roleId: 2,
                statusId: 1
            });

            if (newUser) {
                // const results = await createDefaultTeam(newUser.id);
                // console.log('default team results', results);
                console.log('--------------Creating user as a member------------------------');
                const userAsMember = await Member.create({
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    phone: newUser.phone,
                    createdBy: newUser.id
                });
                console.log(`--------------Member ${userAsMember.firstName} created successfully------------------`);

                console.log('--------------Creating default Team------------------------');
                const defaultTeam = await Team.create({ name: 'Default', description: 'This is a default team created by the system and cannot be deleted ,members added here this team will all receive notifications', createdBy: newUser.id });
                console.log(`--------------${defaultTeam.name} team created successfully------------------`);

                console.log('--------------Adding member to default team------------------------');
                await defaultTeam.addMember(userAsMember.id);
                console.log(`--------------Member ${userAsMember.firstName} has been added to Detault team------------------`);

                return res.redirect('/signin?success=user_created');
            }
        } catch (error) {
            return res.redirect(`/signin?error=uknown_error`);
        }

        // return await User.findOne({
        //     where: {
        //         email: email,
        //     }
        // }).then((existingUser) => {
        //     console.log('Existing user is', existingUser);

        //     // if a user is not found matching the records create the user
        //     if (!existingUser) {
        //         return createdUser = User.create({
        //             firstName,
        //             lastName,
        //             email,
        //             phone,
        //             password: hashedPassword,
        //             roleId: 2,
        //             statusId: 1
        //         })

        //     } else {
        //         return res.redirect('/dashboard/users?error=user_exists');
        //     }
        // })
        //     // .then(async (createdUser) => {
        //     //     const results = await createDefaultTeam(newUser.id);
        //     //     console.log('created default team', results);
        //     //     return createdUser;
        //     // })
        //     .then((createdUser) => {
        //         // console.log(createdUser)
        //         if (createdUser) {
        //             return res.redirect('/signin?success=user_created');
        //         }

        //     }).catch((error) => {
        //         return res.json({
        //             message: {
        //                 status: 'error',
        //                 info: error.message
        //             }
        //         })
        //     });
        // }
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
        // return await User.findOne({
        //     where: {
        //         email: email,
        //     }
        // }).then((existingUser) => {
        //     console.log('Existing user is', existingUser);

        //     if (!existingUser) {
        //         return createdUser = User.create({
        //             firstName,
        //             lastName,
        //             email,
        //             password: hashedPassword,
        //             roleId: 2,
        //             statusId: 2
        //         })

        //     } else {
        //         return res.redirect('/signup?error=user_exists');
        //     }
        // }).then((createdUser) => {
        //     console.log(createdUser)
        //     res.redirect('/login?success=user_created');
        // }).catch((error) => {
        //     res.json({
        //         message: {
        //             status: 'error',
        //             info: error.message
        //         }
        //     })
        // });
    },
}