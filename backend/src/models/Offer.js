const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      unique: true,
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true
    },
    designation: {
      type: String,
      required: [true, 'Designation / job role is required'],
      trim: true
    },
    packageLPA: {
      type: Number,
      required: [true, 'CTC package in LPA is required'],
      min: [0, 'Package cannot be negative']
    },
    offerLetterUrl: {
      type: String,
      trim: true
    },
    offerDate: {
      type: Date,
      default: Date.now
    },
    joiningDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Offered', 'Accepted', 'Declined', 'Joined'],
      default: 'Offered',
      index: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Offer', offerSchema);
