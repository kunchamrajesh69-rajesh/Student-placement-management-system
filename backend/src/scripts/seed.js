require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Company = require('../models/Company');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Offer = require('../models/Offer');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_placement_db';
    console.log(`[Seed Script]: Connecting to ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed Script]: Clearing old data...');
    await Promise.all([
      User.deleteMany(),
      Student.deleteMany(),
      Department.deleteMany(),
      Company.deleteMany(),
      JobDrive.deleteMany(),
      Application.deleteMany(),
      Interview.deleteMany(),
      Offer.deleteMany()
    ]);

    console.log('[Seed Script]: Creating Academic Departments...');
    const [deptCSE, deptECE, deptIT, deptMECH] = await Department.create([
      {
        code: 'CSE',
        name: 'Computer Science and Engineering',
        description: 'Department of Computing, Systems & AI'
      },
      {
        code: 'ECE',
        name: 'Electronics and Communication Engineering',
        description: 'Department of Microelectronics, Signal Processing & IoT'
      },
      {
        code: 'IT',
        name: 'Information Technology',
        description: 'Department of Enterprise Software & Cloud Infrastructure'
      },
      {
        code: 'MECH',
        name: 'Mechanical Engineering',
        description: 'Department of Robotics, CAD & Thermal Systems'
      }
    ]);

    console.log('[Seed Script]: Creating Admin / Placement Officer Account...');
    const adminUser = await User.create({
      email: 'admin@placement.edu',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true
    });

    console.log('[Seed Script]: Creating Recruiting Companies...');
    const [google, msft, amazon, infosys] = await Company.create([
      {
        name: 'Google LLC',
        website: 'https://careers.google.com',
        industry: 'Information Technology & Cloud',
        description: 'Global technology leader in search, cloud computing, and AI systems.',
        address: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
        hrContacts: [
          { name: 'Aditi Varma', email: 'aditi.hr@google.com', phone: '+91 9876543210', designation: 'University Talent Partner' }
        ],
        status: 'Active'
      },
      {
        name: 'Microsoft Corporation',
        website: 'https://careers.microsoft.com',
        industry: 'Software & Cloud Infrastructure',
        description: 'Empowering every person and organization on the planet to achieve more.',
        address: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
        hrContacts: [
          { name: 'Kunal Sen', email: 'kunal.hr@microsoft.com', phone: '+91 9876543211', designation: 'Campus Recruitment Lead' }
        ],
        status: 'Active'
      },
      {
        name: 'Amazon Development Centre',
        website: 'https://amazon.jobs',
        industry: 'E-Commerce & Cloud Services',
        description: 'Pioneering customer obsession and global distributed cloud platforms.',
        address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
        hrContacts: [
          { name: 'Rohit Menon', email: 'rohit.hr@amazon.com', phone: '+91 9876543212', designation: 'University Recruiting Specialist' }
        ],
        status: 'Active'
      },
      {
        name: 'Infosys Limited',
        website: 'https://www.infosys.com/careers',
        industry: 'IT Consulting & Enterprise Solutions',
        description: 'A global leader in next-generation digital services and consulting.',
        address: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
        hrContacts: [
          { name: 'Deepa Nair', email: 'deepa.hr@infosys.com', phone: '+91 9876543213', designation: 'Campus Relations Manager' }
        ],
        status: 'Active'
      }
    ]);

    console.log('[Seed Script]: Creating Students...');

    // Student 1: Rajesh Kumar (High CGPA, CSE, Eligible for top drives)
    const rajeshUser = new User({
      email: 'rajesh.cse@student.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    const rajeshStudent = new Student({
      user: rajeshUser._id,
      rollNumber: '21CS101',
      fullName: 'Rajesh Kumar',
      email: 'rajesh.cse@student.edu',
      phone: '+91 9123456780',
      department: deptCSE._id,
      batch: 2025,
      cgpa: 8.85,
      activeBacklogs: 0,
      historicalBacklogs: 0,
      skills: ['Angular', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker'],
      projects: [
        {
          title: 'Campus Food Delivery Portal',
          description: 'Full stack food ordering platform with live order tracking',
          techStack: ['Angular', 'Node.js', 'MongoDB'],
          projectUrl: 'https://github.com/rajesh/campus-food'
        }
      ],
      certifications: [
        {
          title: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2024-05-15')
        }
      ],
      resumeUrl: 'https://drive.google.com/sample-rajesh-resume.pdf',
      placementStatus: 'Shortlisted'
    });
    rajeshUser.studentProfile = rajeshStudent._id;
    await rajeshUser.save();
    await rajeshStudent.save();

    // Student 2: Sneha Reddy (Top Tier CSE, High CGPA, Placed with Google)
    const snehaUser = new User({
      email: 'sneha.cse@student.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    const snehaStudent = new Student({
      user: snehaUser._id,
      rollNumber: '21CS102',
      fullName: 'Sneha Reddy',
      email: 'sneha.cse@student.edu',
      phone: '+91 9123456781',
      department: deptCSE._id,
      batch: 2025,
      cgpa: 9.4,
      activeBacklogs: 0,
      historicalBacklogs: 0,
      skills: ['Python', 'Data Structures', 'Machine Learning', 'C++', 'System Design'],
      resumeUrl: 'https://drive.google.com/sample-sneha-resume.pdf',
      placementStatus: 'Placed',
      placedDetails: {
        company: google._id,
        role: 'Associate Software Engineer',
        packageLPA: 22.5,
        offerDate: new Date('2025-01-10')
      }
    });
    snehaUser.studentProfile = snehaStudent._id;
    await snehaUser.save();
    await snehaStudent.save();

    // Student 3: Priya Sharma (ECE, Has 2 backlogs -> Tests ineligibility filter)
    const priyaUser = new User({
      email: 'priya.ece@student.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    const priyaStudent = new Student({
      user: priyaUser._id,
      rollNumber: '21EC201',
      fullName: 'Priya Sharma',
      email: 'priya.ece@student.edu',
      phone: '+91 9123456782',
      department: deptECE._id,
      batch: 2025,
      cgpa: 6.45,
      activeBacklogs: 2,
      historicalBacklogs: 2,
      skills: ['Embedded Systems', 'Verilog', 'C++', 'MATLAB'],
      resumeUrl: 'https://drive.google.com/sample-priya-resume.pdf',
      placementStatus: 'Unplaced'
    });
    priyaUser.studentProfile = priyaStudent._id;
    await priyaUser.save();
    await priyaStudent.save();

    // Student 4: Amit Patel (IT, CGPA 7.8, Good fit for Microsoft & Infosys)
    const amitUser = new User({
      email: 'amit.it@student.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    const amitStudent = new Student({
      user: amitUser._id,
      rollNumber: '21IT301',
      fullName: 'Amit Patel',
      email: 'amit.it@student.edu',
      phone: '+91 9123456783',
      department: deptIT._id,
      batch: 2025,
      cgpa: 7.8,
      activeBacklogs: 0,
      historicalBacklogs: 1,
      skills: ['Java', 'Spring Boot', 'SQL', 'JavaScript', 'React'],
      resumeUrl: 'https://drive.google.com/sample-amit-resume.pdf',
      placementStatus: 'Offered'
    });
    amitUser.studentProfile = amitStudent._id;
    await amitUser.save();
    await amitStudent.save();

    // Student 5: Karthik Verma (MECH, CGPA 7.2, Eligible for Infosys & Mech drives)
    const karthikUser = new User({
      email: 'karthik.mech@student.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    const karthikStudent = new Student({
      user: karthikUser._id,
      rollNumber: '21ME401',
      fullName: 'Karthik Verma',
      email: 'karthik.mech@student.edu',
      phone: '+91 9123456784',
      department: deptMECH._id,
      batch: 2025,
      cgpa: 7.25,
      activeBacklogs: 0,
      historicalBacklogs: 0,
      skills: ['AutoCAD', 'SolidWorks', 'Ansys', 'Python Basics'],
      resumeUrl: 'https://drive.google.com/sample-karthik-resume.pdf',
      placementStatus: 'Unplaced'
    });
    karthikUser.studentProfile = karthikStudent._id;
    await karthikUser.save();
    await karthikStudent.save();

    console.log('[Seed Script]: Creating Placement Drives with Strict Criteria...');

    // Drive 1: Google
    const driveGoogle = await JobDrive.create({
      title: 'Associate Software Engineer (Campus 2025)',
      company: google._id,
      description: 'Design and build world-scale software solutions in search, cloud infrastructure, and distributed storage systems.',
      jobType: 'Full-Time',
      location: 'Bengaluru / Hyderabad',
      salaryPackage: {
        ctcLpa: 22.5,
        stipendPerMonth: 85000,
        breakup: 'Base: 16 LPA + 4 LPA Stock Grants + 2.5 LPA Joining Bonus'
      },
      requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'C++ or Java or Python'],
      eligibilityCriteria: {
        minCgpa: 8.0,
        maxBacklogs: 0,
        allowHistoricalBacklogs: true,
        eligibleDepartments: [deptCSE._id, deptIT._id],
        eligibleBatches: [2025]
      },
      selectionProcess: ['Online Coding Assessment (LeetCode Hard)', 'Technical Round 1 (DSA)', 'Technical Round 2 (System Architecture)', 'Googliness & Leadership'],
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: adminUser._id
    });

    // Drive 2: Microsoft
    const driveMsft = await JobDrive.create({
      title: 'Cloud Solutions Engineer (Azure)',
      company: msft._id,
      description: 'Work directly with enterprise architects to build resilient cloud architectures, CI/CD pipelines, and scalable APIs.',
      jobType: 'Full-Time',
      location: 'Hyderabad / Noida',
      salaryPackage: {
        ctcLpa: 16.0,
        stipendPerMonth: 60000,
        breakup: 'Base: 12.5 LPA + Performance Bonus 3.5 LPA'
      },
      requiredSkills: ['Cloud Fundamentals', 'Python or C#', 'Linux', 'Networking'],
      eligibilityCriteria: {
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowHistoricalBacklogs: true,
        eligibleDepartments: [deptCSE._id, deptECE._id, deptIT._id],
        eligibleBatches: [2025]
      },
      selectionProcess: ['Online Technical Assessment', 'Problem Solving Round', 'System & Cloud Fundamentals', 'HR Interview'],
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: adminUser._id
    });

    // Drive 3: Infosys
    const driveInfosys = await JobDrive.create({
      title: 'Digital Specialist Engineer (DSE)',
      company: infosys._id,
      description: 'Drive modernization for Fortune 500 enterprises using modern microservices, full-stack frameworks, and automation.',
      jobType: 'Full-Time',
      location: 'Pune / Bengaluru / Hyderabad / Chennai',
      salaryPackage: {
        ctcLpa: 6.5,
        stipendPerMonth: 25000,
        breakup: 'Fixed: 6.0 LPA + 0.5 LPA Retaining Bonus'
      },
      requiredSkills: ['Core Java / Python / C++', 'Object Oriented Programming', 'SQL Fundamentals'],
      eligibilityCriteria: {
        minCgpa: 6.0,
        maxBacklogs: 1,
        allowHistoricalBacklogs: true,
        eligibleDepartments: [deptCSE._id, deptECE._id, deptIT._id, deptMECH._id],
        eligibleBatches: [2025]
      },
      selectionProcess: ['InfyTQ Certification Assessment', 'Technical Interview', 'HR Discussions'],
      applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: adminUser._id
    });

    console.log('[Seed Script]: Creating Applications & Pipelines...');

    // 1. Rajesh applies to Google (Shortlisted)
    const appRajeshGoogle = await Application.create({
      student: rajeshStudent._id,
      jobDrive: driveGoogle._id,
      currentStage: 'Shortlisted',
      stageHistory: [
        { stage: 'Applied', updatedBy: rajeshUser._id, updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), remarks: 'Applied via portal' },
        { stage: 'Shortlisted', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), remarks: 'Resume and CGPA shortlisted' }
      ],
      studentSnapshot: {
        cgpa: rajeshStudent.cgpa,
        activeBacklogs: rajeshStudent.activeBacklogs,
        department: deptCSE._id,
        batch: 2025
      },
      isEligibleAtApply: true
    });

    // 2. Rajesh applies to Microsoft (Interview stage)
    const appRajeshMsft = await Application.create({
      student: rajeshStudent._id,
      jobDrive: driveMsft._id,
      currentStage: 'Interview',
      stageHistory: [
        { stage: 'Applied', updatedBy: rajeshUser._id, updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000), remarks: 'Direct portal submission' },
        { stage: 'Shortlisted', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), remarks: 'Eligible & Shortlisted' },
        { stage: 'Assessment', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), remarks: 'Cleared online assessment with 92%' },
        { stage: 'Interview', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), remarks: 'Invited to Round 1 Technical' }
      ],
      studentSnapshot: {
        cgpa: rajeshStudent.cgpa,
        activeBacklogs: rajeshStudent.activeBacklogs,
        department: deptCSE._id,
        batch: 2025
      },
      isEligibleAtApply: true
    });

    // 3. Sneha applies to Google (Joined)
    const appSnehaGoogle = await Application.create({
      student: snehaStudent._id,
      jobDrive: driveGoogle._id,
      currentStage: 'Joined',
      stageHistory: [
        { stage: 'Applied', updatedBy: snehaUser._id, updatedAt: new Date('2024-12-01') },
        { stage: 'Shortlisted', updatedBy: adminUser._id, updatedAt: new Date('2024-12-05') },
        { stage: 'Assessment', updatedBy: adminUser._id, updatedAt: new Date('2024-12-10') },
        { stage: 'Interview', updatedBy: adminUser._id, updatedAt: new Date('2024-12-15') },
        { stage: 'Selected', updatedBy: adminUser._id, updatedAt: new Date('2024-12-20') },
        { stage: 'Offered', updatedBy: adminUser._id, updatedAt: new Date('2025-01-02') },
        { stage: 'Joined', updatedBy: adminUser._id, updatedAt: new Date('2025-01-10') }
      ],
      studentSnapshot: {
        cgpa: snehaStudent.cgpa,
        activeBacklogs: 0,
        department: deptCSE._id,
        batch: 2025
      },
      isEligibleAtApply: true
    });

    // 4. Amit applies to Infosys (Offered)
    const appAmitInfosys = await Application.create({
      student: amitStudent._id,
      jobDrive: driveInfosys._id,
      currentStage: 'Offered',
      stageHistory: [
        { stage: 'Applied', updatedBy: amitUser._id, updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
        { stage: 'Shortlisted', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000) },
        { stage: 'Assessment', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
        { stage: 'Interview', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
        { stage: 'Selected', updatedBy: adminUser._id, updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000) },
        { stage: 'Offered', updatedBy: adminUser._id, updatedAt: new Date() }
      ],
      studentSnapshot: {
        cgpa: amitStudent.cgpa,
        activeBacklogs: 0,
        department: deptIT._id,
        batch: 2025
      },
      isEligibleAtApply: true
    });

    console.log('[Seed Script]: Creating Interviews...');
    await Interview.create([
      {
        application: appRajeshMsft._id,
        student: rajeshStudent._id,
        jobDrive: driveMsft._id,
        roundName: 'Round 1: Cloud & Data Structures',
        interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        interviewTime: '10:30 AM IST',
        mode: 'Online',
        locationOrLink: 'https://teams.microsoft.com/l/meetup-join/sample-round-1',
        instructions: 'Please be in a quiet room, have your ID card ready and keep your webcam on.',
        status: 'Scheduled'
      }
    ]);

    console.log('[Seed Script]: Creating Offers...');
    // Offer for Sneha
    await Offer.create({
      application: appSnehaGoogle._id,
      student: snehaStudent._id,
      jobDrive: driveGoogle._id,
      company: google._id,
      designation: 'Associate Software Engineer',
      packageLPA: 22.5,
      offerLetterUrl: 'https://storage.placement.edu/offers/google-sneha-reddy.pdf',
      offerDate: new Date('2025-01-02'),
      joiningDate: new Date('2025-07-15'),
      status: 'Joined',
      remarks: 'Top performing candidate in system design round'
    });

    // Offer for Amit
    await Offer.create({
      application: appAmitInfosys._id,
      student: amitStudent._id,
      jobDrive: driveInfosys._id,
      company: infosys._id,
      designation: 'Digital Specialist Engineer',
      packageLPA: 6.5,
      offerLetterUrl: 'https://storage.placement.edu/offers/infosys-amit-patel.pdf',
      offerDate: new Date(),
      joiningDate: new Date('2025-08-01'),
      status: 'Offered',
      remarks: 'Congratulations on selection'
    });

    console.log('===========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! REAL TEST DATA POPULATED: ');
    console.log(' - Admin User    : admin@placement.edu / AdminPassword123!');
    console.log(' - Student 1 (CSE): rajesh.cse@student.edu / StudentPassword123!');
    console.log(' - Student 2 (CSE): sneha.cse@student.edu / StudentPassword123! (Placed)');
    console.log(' - Student 3 (ECE): priya.ece@student.edu / StudentPassword123! (2 backlogs)');
    console.log(' - Student 4 (IT) : amit.it@student.edu / StudentPassword123! (Offered)');
    console.log(' - Student 5 (ME) : karthik.mech@student.edu / StudentPassword123!');
    console.log('===========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error]: ${error.message}`, error);
    process.exit(1);
  }
};

seedData();
