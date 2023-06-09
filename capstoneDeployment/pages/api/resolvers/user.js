import { user, pass } from '../config/default.json'
const User = require('../models/User')
const Club = require('../models/Club')
const { ApolloError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const transporter = require('../email/transporter')
import { Router, useRouter } from 'next/router'


/**
 *
 * Upon login I want to be able to
 *
 */
module.exports = {
  Mutation: {
    registerUser: async (
      _,
      { registerInput: { name, email, password, role, clubName } },
    ) => {
      // See if user already exists
      console.log(name, email, role, password)
      email = email.toLowerCase()
      const userExists = await User.findOne({ email })
      console.log(userExists)
      if (userExists) {
        throw new ApolloError(
          'User with this email is already registed ' + email,
          'USER_ALREADY_EXISTS',
        )
      }

      // Encrypt Password

      var encryptedPassword = await bcrypt.hash(password, 10)

      const user = new User({
        name: name,
        email: email.toLowerCase(),
        password: encryptedPassword,
        role: role,
        clubName: clubName,
      })

      // Create Token
      try {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          config.jwtSecret,
          { expiresIn: 3600 },
        )

        user.token = token

        

        const url = `http://localhost:3000/confirmation/${token}`

        const options = {
          from: user,
          to: email,
          subject: 'Confirm Email!',
          html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
        }

        await transporter.sendMail(options, function (err, info) {
          console.log('Sent: ' + info.response)
        })
      } catch (e) {
        console.log(e)
      }

      //   const clubExisits = await Club.findOne({ email});
      //   if (clubExisits) {
      //     throw new ApolloError(
      //         "Club with this name is already registed " + clubName,
      //         "CLUB_ALREADY_EXISTS"
      //         );
      //     }
      const newClub = new Club({
        name: clubName,
        department: null,
        description: null,
        userID: user._id
      })

      const clubRes = await newClub.save() //This is where MongoDB actually saves
      console.log(clubRes._id)
      user.clubID = clubRes._id
      console.log('Saved club ' + clubRes)

      const res = await user.save()

      return {
        id: res.id,
        ...res._doc,
      }
    },
    loginUser: async (_, { loginInput: { email, password } }) => {
      // Check if user exists
      const user = await User.findOne({ email })
      console.log(user)
      // console.log(user.confirmed)
      // if (!user.confirmed) {
      //   throw new Error('Please confirm your email to login')
      // }

      // Check if password is correct && Create new Token
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          config.jwtSecret,
          { expiresIn: 3600 },
        )
        user.token = token

        // Update token in db
        await User.updateOne({ email }, { token: token })

        // return all the admins objects.
        if (user.role == 'MASTER') {
          console.log('THIS MAN IS A MASTER')
          const adminUsers = await User.find({ role: 'ADMIN' })
          adminUsers.forEach(
            (element) => (element.userID = element._id),
            // console.log(element._id)
            // console.log(element.userID)
            // element.userID = element._id
          )
          console.log(user.token)
          return {
            token: user.token,
            userRole: user.role,
            adminList: adminUsers,
          }
        }
        // Find associated Club
        const clubID = user.clubID

        //
        const userClub = await Club.findById(clubID)
        console.log(user.role)

        return {
          token: user.token,
          userRole: user.role,
          id: userClub.id,
          ...userClub._doc,
        }
      }
      throw new ApolloError('Incorrect password', 'INCORRECT_PASSWORD')

      // Create new Token
    },
    deleteUser: async (_, { ID: _id }) => {
      // Check if user exists
      const user = await User.findOne({ _id })
      console.log(user)
      // Check if we got a user
      if (user) {
        const wasDeletedUser = (await User.deleteOne(user)).deletedCount
        const wasDeletedClub = (await Club.deleteOne({ _id: user.clubID})).deletedCount
        console.log(wasDeletedClub)
        return wasDeletedUser
      }
      throw new ApolloError('User does not exist ', 'INVALID_USER')
    },
    editUser: async (
      _,
      { changeUserInput: { _id, password, newName, newPassword, newEmail } },
    ) => {
      console.log(_id, password, newName, newPassword, newEmail)
      // Check if user exists
      const user = await User.findOne({ _id })
      console.log(user)
      var changedUser = 0
      var flag = false
      if (user && password == user.password) {
        if (newName) {
          flag = true
          changedUser = await (
            await User.updateOne({ _id: _id }, { name: newName })
          ).modifiedCount
        }
        if (newEmail) {
          flag = true
          changedUser = await (
            await User.updateOne({ _id: _id }, { email: newEmail })
          ).modifiedCount
        }
        if (newPassword) {
          flag = true
          var encryptedPassword = await bcrypt.hash(newPassword, 10)
          changedUser = await (
            await User.updateOne({ _id: _id }, { password: encryptedPassword })
          ).modifiedCount
        }
        if (flag) {
          const newUser = await User.findOne({ _id })
          return {
            userID: newUser.id,
            ...newUser._doc,
          }
        }
        else {
          throw new ApolloError(
            'No fields were changed',
            'INVALID_ENTRY',
          )
        }
      }
      throw new ApolloError(
        'User does not exist or wrong password ',
        'INVALID_ENTRY',
      )
    },
  },
  Query: {
    getAdminList: async (_,{name} ) => {
      const adminUsers = await User.find({ role: 'ADMIN' })
      adminUsers.forEach(
        (element) => (element.userID = element._id),
      )
      return {
        adminList: adminUsers
      }
    },
    user: (_, { ID }) => User.findById(ID),
  },
}
