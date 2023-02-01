const { User, Thought } = require('../models');

// FOR /api/thoughts
module.exports = {
    // Set up GET all thoughts
    getThoughts(req, res) {
        Thought.find()
            .then((thought) => res.status(200).json(thought))
            .catch((err) => res.status(500).json(err));
    },
    // Set up GET a single thought by _id
    getSingleThought(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
        .select('-__v')
        .then((thought) =>
            !thought
                ? res.status(404).json({ message: 'There is no thought with that id!' })
                : res.status(200).json(thought)
        )
        .catch((err) => res.status(500).json(err));
    },
    // Set up POST for creating a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
    createThought(req, res) {
        Thought.create(req.body)
            .then(({ _id }) => {
                return User.findOneAndUpdate(
                    { _id: req.body.userId },
                    { $push: { thoughts: _id } },
                    { new: true },
                )
            })
            .then((user) => 
                !user
                    ? res.status(404).json({ message: 'Thought created, but no user found with this id' })
                    : res.status(200).json('Created the thought 🎉')
            )
            .catch((err) => res.status(500).json(err)); 
    },
    // Set up PUT for updating a thought by _id
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { new: true }
        )
        .then((thought) => 
            !thought
                ? res.status(404).json({ message: 'There is no thought with this id!' })
                : res.status(200).json(thought)
        )
        .catch((err) => res.status(500).json(err));
    },
    // Set up DELETE to remove a thought by _id
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then((thought) => 
                !thought
                ? res.status(404).json({ message: 'There is no thought with this id' })
                : User.findOneAndUpdate(
                    { thoughts: req.params.thoughtId },
                    { $pull: { thoughts: req.params.thoughtId } },
                    { new: true },
                )
            )
            .then((user) =>
                !user
                ? res.status(404).json({ message: 'Thought deleted, but no user found with this id' })
                : res.status(200).json({ message: 'Thought successfully deleted!' })
            )
            .catch((err) => res.status(500).json(err));
    },
    // FOR /api/thoughts/:thoughtId/reactions
    // Set up a POST to create a new reaction stored in a thought's reactions array field
    createReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true },
        )
        .then((thought) =>
            !thought
            ? res.status(404).json({ message: 'There is no thought with this id' })
            : res.status(200).json(thought)
        )
        .catch((err) => res.status(500).json(err));
    },
    // Set up a DELETE to pull and remove a reaction by the reaction's reactionId value
    deleteReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { new: true },
        )
        .then((thought) => 
            !thought
            ? res.status(404).json({ message: 'There is no thought with this id' })
            : res.status(200).json(thought)
        )
        .catch((err) => res.status(500).json(err));
    },
};