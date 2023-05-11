require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const admin = require('../model/admin.model')
const auth = require('./auth.controller')

const saltRounds = process.env.SALT_ROUND
const validateData = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password should be at least 8 characters long' });
    }
}

const createAdmin = async (req, res) => {
    try {
        const { email, name, password } = req.body
        validateData(email, password)
        const adminExists = await admin.findOne({ email })
        if (adminExists) {
            return res.status(409).json({ message: 'Admin already exist' })
        }
        const salt = await bcrypt.genSalt(+saltRounds)
        const hashPass = await bcrypt.hash(password, salt)
        const createUser = await admin.create({
            email,
            name,
            password: hashPass,
        })
        res.json(createUser)
    } catch (error) {
        console.log(error)
    }
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        validateData(email, password)
        const userFound = await admin.findOne({ email })
        if (userFound) {
            const compare = await bcrypt.compare(password, userFound.password)
            console.log({ compare })
            if (!compare) res.json({ message: 'Wrong email or password' })
        } else {
            res.json({ message: 'User Doesn\'t Exist' })
        }
        const accessToken = auth.generateAccessToken(email)
        const refreshToken = auth.generateRefreshToken(email)
        return res.status(200).json({ accessToken, refreshToken, username: userFound.name })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    createAdmin,
    loginAdmin,
}