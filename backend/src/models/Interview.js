const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      trim: true
    },
    recommendedForNextRound: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    jobDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDrive',
      required: [true, 'Job drive reference is required'],
      index: true
    },
    roundName: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true
    },
    interviewDate: {
      type: Date,
      required: [true, 'Interview date is required']
    },
    interviewTime: {
      type: String,
      required: [true, 'Interview time is required'],
      trim: true
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online'
    },
    locationOrLink: {
      type: String,
      required: [true, 'Location or meeting link is required'],
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
      index: true
    },
    feedback: feedbackSchema
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
