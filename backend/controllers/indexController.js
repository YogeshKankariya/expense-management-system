const getApiStatus = (req, res) => {
  res.json({
    message: "Expense Management System API is running",
  });
};

module.exports = {
  getApiStatus,
};
