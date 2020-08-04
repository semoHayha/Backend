
const express = require('express')
const { createBook, getImage, getBook, fetchAllBooks } = require('../../controllers/book/mBook')
const { isSignedIn, isAuthenticated, isAdmin, getProfileById, isLibrarian } = require('../../controllers/auth/authAdministration')
const router = express.Router()

router.param('accession_no', getBook)
router.param("profileId", getProfileById);

router.post('/books/:profileId',isSignedIn,isAuthenticated,isAdmin, createBook)
router.get('/getImage/:accession_no',getImage)

router.get('/fetchAllBooks/:profileId',isSignedIn,isAuthenticated,isLibrarian,fetchAllBooks)

module.exports = router