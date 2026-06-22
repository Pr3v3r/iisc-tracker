const getPriorityScore = (college) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today
  
    const diffDays = (date) => {
      const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    };
  
    // Priority 1: Overdue follow-up
    if (college.followUpDate) {
      const days = diffDays(new Date(college.followUpDate));
      if (days < 0) return 1;
      if (days <= 3) return 2;
      if (days <= 7) return 3;
    }
  
    // Priority 4 & 5: Upcoming visit
    if (college.status === 'Upcoming' && college.visitDate) {
      const days = diffDays(new Date(college.visitDate));
      if (days >= 0 && days <= 3) return 4;
      if (days > 3 && days <= 7) return 5;
    }
  
    return 6; // everything else
  };
  
  module.exports = { getPriorityScore };