const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    completedAt: Date,
  },
  { timestamps: true }
);

// one application per volunteer per task
applicationSchema.index({ task: 1, volunteer: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
