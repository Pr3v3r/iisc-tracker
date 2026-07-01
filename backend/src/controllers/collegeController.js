const College = require('../models/College');

// GET /api/colleges
const { getPriorityScore } = require('../utils/priorityUtils');
const AuditLog = require('../models/AuditLog');

const getColleges = async (req, res) => {
  try {
    const { search, status, employee } = req.query;
    const query = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.collegeName = { $regex: escaped, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (employee) {
      query.assignedEmployee = {
        $regex: employee.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }

    const colleges = await College.find(query);

    // Sort by priority score ascending (1 = highest priority)
    colleges.sort((a, b) => getPriorityScore(a) - getPriorityScore(b));

    res.json({ success: true, count: colleges.length, data: colleges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/colleges/:id
const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, error: 'College not found' });
    }
    res.json({ success: true, data: college });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/colleges
const createCollege = async (req, res) => {
  try {
    const normalizedName = req.body.collegeName?.trim().toLowerCase();

    const existing = await College.findOne({ collegeNameNormalized: normalizedName });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A college named "${existing.collegeName}" already exists`,
      });
    }
    req.body.lastUpdatedBy = req.employeeName;
    const college = await College.create(req.body);
    res.status(201).json({ success: true, data: college });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// PUT /api/colleges/:id
const updateCollege = async (req, res) => {
  try {
    if (req.body.collegeName) {
      const normalizedName = req.body.collegeName.trim().toLowerCase();
      const existing = await College.findOne({
        collegeNameNormalized: normalizedName,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `A college named "${existing.collegeName}" already exists`,
        });
      }
      req.body.collegeNameNormalized = normalizedName;
    }

    // Overdue date change detection
    const currentCollege = await College.findById(req.params.id);
    if (!currentCollege) {
      return res.status(404).json({ success: false, error: 'College not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const datesToCheck = ['followUpDate', 'visitDate'];

    for (const field of datesToCheck) {
      const incomingDate = req.body[field];
      const currentDate = currentCollege[field];

      if (incomingDate && currentDate) {
        const current = new Date(currentDate);
        current.setHours(0, 0, 0, 0);
        const incoming = new Date(incomingDate);
        incoming.setHours(0, 0, 0, 0);

        const isOverdue = current < today;
        const isChanging = current.getTime() !== incoming.getTime();

        if (isOverdue && isChanging) {
          const { reason } = req.body;
          if (!reason || !reason.trim()) {
            return res.status(400).json({
              success: false,
              error: `A reason is required to reschedule an overdue ${field === 'followUpDate' ? 'follow-up' : 'visit'} date`,
              requiresReason: true,
              field,
            });
          }

          await AuditLog.create({
            eventType: 'POSTPONE',
            collegeName: currentCollege.collegeName,
            collegeId: currentCollege._id,
            performedBy: req.employeeName,
            reason: reason.trim(),
            metadata: {
              field,
              oldDate: currentDate,
              newDate: new Date(incomingDate),
            },
          });
        }
      }
    }

    // Remove reason from body before saving to College
    delete req.body.reason;
    req.body.lastUpdatedBy = req.employeeName;

    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: college });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/colleges/:id
const deleteCollege = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A reason is required to delete a college',
      });
    }

    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, error: 'College not found' });
    }

    await AuditLog.create({
      eventType: 'DELETION',
      collegeName: college.collegeName,
      collegeId: college._id,
      performedBy: req.employeeName,
      reason: reason.trim(),
    });

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const colleges = await College.find();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const stats = {
      total: colleges.length,
      upcoming: 0,
      visited: 0,
      overdueFollowUps: 0,
      followUpsThisWeek: 0,
      upcomingVisitsThisWeek: 0,
    };

    for (const college of colleges) {
      if (college.status === 'Upcoming') stats.upcoming++;
      if (college.status === 'Visited') stats.visited++;

      if (college.followUpDate) {
        const followUp = new Date(college.followUpDate);
        if (followUp < today) stats.overdueFollowUps++;
        else if (followUp <= sevenDaysLater) stats.followUpsThisWeek++;
      }

      if (college.status === 'Upcoming' && college.visitDate) {
        const visit = new Date(college.visitDate);
        if (visit >= today && visit <= sevenDaysLater) {
          stats.upcomingVisitsThisWeek++;
        }
      }
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  getDashboardStats,
};