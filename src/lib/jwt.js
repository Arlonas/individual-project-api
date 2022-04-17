const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const JWT_SECRET = process.env.JWT_SECRET_KEY

const algorithm = 'aes-256-cbc'
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

const encrypt = (text) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }

}

const decrypt = (text) => {
    let iv = Buffer.from(text.iv, 'hex')
    let encryptedText = Buffer.from(text.encryptedData, 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

const generateToken = (payload) => {
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "2d"
    })

    const encryptedToken = encrypt(token)

    return encryptedToken
}

const verifyToken = (token) => {
    const decryptToken = decrypt(token)
    const isVerified = jwt.verify(decryptToken, JWT_SECRET)

    return isVerified
}

module.exports = {
    generateToken,
    verifyToken
}