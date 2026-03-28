const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    progressDone: { type: Number, default: 0, min: 0 },
    progressTotal: { type: Number, default: 5, min: 1 },
    startDate: { type: Date },
    dueDate: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

