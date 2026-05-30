const express = require('express')
const { protect } = require('../middleware/auth')
const { createCollection, getCollection, addProject, followCollection } = require('../controllers/collectionController')

const router = express.Router()

router.post('/', protect, createCollection)
router.get('/:id', getCollection)
router.post('/:id/projects', protect, addProject)
router.post('/:id/follow', protect, followCollection)

module.exports = router
