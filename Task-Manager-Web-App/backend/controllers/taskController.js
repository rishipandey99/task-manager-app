const mongoose = require('mongoose');
const Task = require('../models/Task');

function taskAccessFilter(userId) {
  return {
    $or: [{ user: userId }, { assignees: userId }],
  };
}

function normalizeAssignees(bodyAssignees) {
  if (!Array.isArray(bodyAssignees)) return [];
  return [...new Set(bodyAssignees.filter((id) => mongoose.isValidObjectId(id)))];
}

async function getTasks(req, res) {
  try {
    const tasks = await Task.find(taskAccessFilter(req.user._id))
      .populate('user', 'name email')
      .populate('assignees', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

async function createTask(req, res) {
  try {
    const {
      title,
      description,
      status,
      priority,
      progressDone,
      progressTotal,
      startDate,
      dueDate,
      assignees,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      progressDone,
      progressTotal,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      user: req.user._id,
      assignees: normalizeAssignees(assignees),
    });

    const populated = await Task.findById(task._id)
      .populate('user', 'name email')
      .populate('assignees', 'name email');

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Invalid data' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const {
      title,
      description,
      status,
      priority,
      progressDone,
      progressTotal,
      startDate,
      dueDate,
      assignees,
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (progressDone !== undefined) updates.progressDone = progressDone;
    if (progressTotal !== undefined) updates.progressTotal = progressTotal;
    if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignees !== undefined) updates.assignees = normalizeAssignees(assignees);

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, ...taskAccessFilter(req.user._id) },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('assignees', 'name email');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(updatedTask);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Invalid data' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found or you can only delete tasks you created',
      });
    }

    return res.status(200).json({ message: 'Task deleted', task: deletedTask });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
