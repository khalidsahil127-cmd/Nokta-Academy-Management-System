const express = require("express");
const router = express.Router();
const Student = require("../models/studentModle");

router.post('/register', async (req, res) => {
    try {
        const {firstName, lastName, email, phone, courses} = req.body;

        const studentExists = await Student.findOne({email});
        if (studentExists) {
            return res.status(400).json({message: "Student already exsits!"});
        }

        const student = await Student.create({
            firstName,
            lastName,
            email,
            phone,
            courses
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
});

router.get("/", async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedData = req.body;

    const student = await Student.findByIdAndUpdate(studentId, updatedData, {
      new: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findByIdAndDelete(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }
    res.status(200).json({ message: "Student Deleted SucesFully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;