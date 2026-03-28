const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');
const User = require('../models/User');

function safeUser(u) {
  return { id: u._id.toString(), name: u.name, email: u.email };
}

async function getUsers(req, res) {
  try {
    const users = await User.find().select('name email').sort({ name: 1 });
    return res.status(200).json(users.map((u) => safeUser(u)));
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

async function createTeamMember(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return res.status(201).json(safeUser(user));
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    return res.status(400).json({ message: err.message || 'Invalid data' });
  }
}

async function deleteTeamMember(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (req.user._id.toString() === id) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Task.updateMany({ assignees: id }, { $pull: { assignees: id } });
    await Task.updateMany({ user: id }, { user: req.user._id });

    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Member removed', id });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

module.exports = { getUsers, createTeamMember, deleteTeamMember };
