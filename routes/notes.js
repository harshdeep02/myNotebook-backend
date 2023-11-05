const express = require('express')
const fetchuser = require('../middelware/fetchuser')
const router = express.Router()
const note = require('../models/note')
const { body, validationResult } = require('express-validator');

//Route 1:- Fetch all notes of user using GET "api/notes/fetchnotes"  api.  Login required
router.get('/fetchnotes', fetchuser, async (req, res) => {
    try {
        // find all the user notes
        const usernotes = await note.find({ user: req.user.id })
        res.json(usernotes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("internel error found")
    }
})

//Route 2:- Add a user note using POST "api/notes/addnotes"  api.  Login required
router.post('/addnotes',fetchuser, [
    body('title', 'Title must be 1 characters').isLength({ min: 1 }),
    body('description', 'Description must be 1 characters').isLength({ min: 1 }),
], async (req, res) => {

    // if there is error. Then send the bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, description, tag } = req.body  //use destructing

        const Notes = new note({ title, description, tag, user: req.user.id })
        if (Notes) {
            const savednote = await Notes.save({writeConcern: { w: 1 }})
            return res.json(savednote)
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json("internel error found")
    }

})



//Route 3:- Update the user note using PUT "api/notes/updatenotes"  api.  Login required
router.put('/updatenotes/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body

    try {

        const newNotes = {}
        if (title) { newNotes.title = title }
        if (description) { newNotes.description = description }
        if (tag) { newNotes.tag = tag }

        // find the notes by id or from api req "id"
        let notes = await note.findById(req.params.id)
        if (!notes) {
            return res.status(404).send("Not Found")
        }
        // Allowing to update note only if the user has own note
        if (notes.user.toString() !== req.user.id) {
            return res.status(401).send("Not Valid")
        }

        const updatenotes = await note.findByIdAndUpdate(req.params.id, { $set: newNotes },{writeConcern: { w: 1 }}) //, { new: true }
        res.send(updatenotes)

    } catch (error) {
        console.error(error.message)
        res.status(500).send("internel error found")
    }

})

// Route 4:- Delete the user note using DELETE "api/notes/deletenotes/:id" api. Login required

router.delete('/deletenotes/:id', fetchuser, async (req, res) => {

    try {

        // find the notes by id or from api req "id"
        const notes = await note.findById(req.params.id)
        if (!notes) {
            return res.status(404).send("Not Found")
        }

        // Allowing to update note only if the user has own note
        if (notes.user.toString() !== req.user.id) {
            return res.status(401).send("Not Valid")
        }

        const deletenotes = await note.findByIdAndDelete(req.params.id, {writeConcern: { w: 1 }})
        res.send({ "Sucess": "Note has been deleted" , deletenotes})
        
    } catch (error) {
        console.error(error.message)
        res.status(500).send("internel error found")
    }
})

module.exports = router