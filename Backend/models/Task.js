const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['teaching', 'translation', 'design', 'tech', 'other'],
      default: 'other',
    },
    durationMins: { type: Number, required: true, min: 15, max: 240 },
    mode: { type: String, enum: ['online', 'onsite'], default: 'online' },
    location: String,
    date: { type: Date, required: true },
    slotsAvailable: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['open', 'filled', 'completed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
