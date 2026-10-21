const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true },
    issueDate: { type: Date },
    credentialUrl: { type: String, trim: true }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    projectUrl: { type: String, trim: true }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true
    },
    batch: {
      type: Number,
      required: [true, 'Graduation batch year is required'],
      index: true
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be less than 0'],
      max: [10, 'CGPA cannot exceed 10'],
      index: true
    },
    activeBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Backlogs cannot be negative'],
      index: true
    },
    historicalBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    certifications: [certificationSchema],
    projects: [projectSchema],
    resumeUrl: {
      type: String,
      trim: true
    },
    placementStatus: {
      type: String,
      enum: ['Unplaced', 'Shortlisted', 'Interviewing', 'Offered', 'Placed'],
      default: 'Unplaced',
      index: true
    },
    placedDetails: {
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
      },
      role: { type: String, trim: true },
      packageLPA: { type: Number },
      offerDate: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for eligibility searches
studentSchema.index({ department: 1, batch: 1, cgpa: -1 });

module.exports = mongoose.model('Student', studentSchema);
