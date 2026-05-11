// controllers/feeController.js

const Fee = require("../models/Fee");


// Admin: Assign Fee to Student
exports.assignFee = async (req, res) => {
  try {
    const { student, amount, dueDate } = req.body;

    const fee = await Fee.create({
      student,
      amount,
      dueDate
    });

    res.json({
      success: true,
      message: "Fee assigned",
      data: fee
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


//  Student: View My Fees
exports.getMyFees = async (req, res) => {
  const fees = await Fee.find({ student: req.user.id });
  res.json(fees);
};


// Admin/Warden: View All Fees
exports.getAllFees = async (req, res) => {
  const fees = await Fee.find().populate("student");
  res.json(fees);
};


//  Student: Pay Fee
exports.payFee = async (req, res) => {
  const { id } = req.params;

  const fee = await Fee.findById(id);

  if (fee.status === "Paid") {
  return res.json({ message: "Already paid" });
}

  if (!fee) return res.json({ message: "Fee not found" });

  //  Fine Calculation (simple logic)
  const today = new Date();

  if (today > fee.dueDate) {
    const lateDays = Math.ceil(
      (today - fee.dueDate) / (1000 * 60 * 60 * 24)
    );

    fee.fine = lateDays * 10; // ₹10 per day
  }

  fee.status = "Paid";
  fee.paidAt = today;

  await fee.save();

  res.json({
    message: "Payment successful",
    fee
  });
};