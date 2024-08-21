const router = require("express").Router();
const Job = require("../models/Job");
const authMiddleware = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");

// Create Job
router.post("/", authMiddleware, admin, async (req, res) => {
  const { company, position, location, contractType } = req.body;

  try {
    const newJob = new Job({
      companyName: company,
      position,
      location,
      contract: contractType,
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Edit an existing job (Admins only)
router.put("/:id", authMiddleware, admin, async (req, res) => {
  const { companyName, position, location, contract } = req.body;

  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    job.companyName = companyName;
    job.position = position;
    job.location = location;
    job.contract = contract;

    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete a job (Admins only)
router.delete("/:id", authMiddleware, admin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    await job.deleteOne({ _id: req.params.id });
    res.json({ msg: "Job removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Apply for a job (Regular users)
router.put("/apply/:id", authMiddleware, async (req, res) => {
  try {
    // Fetch the job and user concurrently
    const [job, user] = await Promise.all([
      Job.findById(req.params.id),
      User.findById(req.user.id),
    ]);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the user has already applied for the job
    if (job.applicants.includes(user.id)) {
      return res
        .status(400)
        .json({ msg: "User has already applied for this job" });
    }

    // Add the user to the job's applicants
    job.applicants.push(user.id);
    await job.save();

    // Add the job to the user's applied jobs
    user.appliedJobs.push(job.id);
    await user.save();

    res.json({ msg: "Job applied successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all jobs the user has applied to (Regular users)
router.get('/applied', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('appliedJobs');
        res.json(user.appliedJobs);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({message : 'Server error'});
    }
});

// Get Jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Jobs of User
router.get("/non-applied", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('appliedJobs', '_id');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get an array of job IDs the user has applied for
        const appliedJobIds = user.appliedJobs.map(job => job._id);

        // Fetch jobs that the user has not applied for
        const jobs = await Job.find({ _id: { $nin: appliedJobIds } });

        res.json(jobs);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server error' });
    }
  });

module.exports = router;
