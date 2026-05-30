const express = require('express')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, toggleUpvote,
} = require('../controllers/projectController')
const changelogController = require('../controllers/changelogController')

const router = express.Router()

router.get('/', getProjects)
router.post('/', protect, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'screenshots', maxCount: 5 }]), createProject)
router.get('/:id', getProject)
router.put('/:id', protect, updateProject)
router.delete('/:id', protect, deleteProject)
router.post('/:id/upvote', protect, toggleUpvote)
router.get('/:id/changelogs', changelogController.getChangelogs)
router.post('/:id/changelogs', protect, changelogController.createChangelog)

module.exports = router
