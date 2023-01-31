const { User, Thought } = require('../models');

// FOR /api/users
module.exports = {
    // Set up GET all users
    getUsers(req, res) {
        User.find()
            .then((users) => res.status(200).json(users))
            .catch((err) => res.status(500).json(err));
    },
    // Set up GET a single user by _id and populate thought and friend data
    getSingleUser(req, res) {
        User.findOne({ _id: req.params.userId })
        .select('__v')
        .then((user) =>
            !user
                ? res.status(404).json({ message: 'There is no user with that id!' })
                : res.status(200).json(user)
        )
        .catch((err) => res.status(500).json(err));
    },
    // Set up POST for creating a new user
    createUser(req, res) {
        User.create(req.body)
            .then((userData) => res.status(200).json(userData))
            .catch((err) => res.status(500).json(err));
    },
    // Set up PUT for updating a user by _id
    updateUser(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
        .then((user) => 
            !user
                ? res.status(404).json({ message: 'There is no user with this id!' })
                : res.status(200).json(user)
        )
        .catch((err) => res.status(500).json(err));
    },
    // Set up DELETE to remove a user by _id
    // BONUS: Remove a user's associated thoughts when deleted
    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.params.userId })
        .then((user) => 
            !user
                ? res.status(404).json({ message: 'There is no user with this id!' })
                : Thought.deleteMany({ _id: { $in: user.thoughts }})
        )
        .then(() => res.status(200).json({ message: 'The user and thoughts have been deleted!' }))
        .catch((err) => res.status(500).json(err));
    },
    // FOR /api/users/:userId/friends/:friendsId
    // Set up a POST to add a new friend to a user's friend list
    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { runValidators: true, new: true },
            )
            .then((user) => 
                !user
                    ? res.status(404).json({ message: 'There is no user with this id!' })
                    : res.status(200).json(user)
            )
            .catch((err) => res.status(500).json(err));
    },
    // Set up a DELETE to remove a friend from a user's friend list
    deleteFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true },
        )
        .then((user) => 
            !user
                ? res.status(404).json({ message: 'There is no user with that id!' })
                : res.status(200).json(user)    
        )
        .catch((err) => res.status(500).json(err));
    },
};