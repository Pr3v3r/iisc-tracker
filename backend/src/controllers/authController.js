const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { password, employeeName } = req.body;

  if (!password || !employeeName) {
    return res.status(400).json({
      success: false,
      error: 'Password and employee name are required',
    });
  }

  if (password !== process.env.SHARED_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }

  const token = jwt.sign(
    { employeeName: employeeName.trim() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ success: true, token, employeeName: employeeName.trim() });
};

module.exports = { login };