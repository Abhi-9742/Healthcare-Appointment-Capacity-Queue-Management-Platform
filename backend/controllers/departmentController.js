const Department = require("../models/Department");

// 1. Add Department
const addDepartment = async (req, res) => {
    try {
        const { name, description, location } = req.body;

        const department = new Department({
            name,
            description,
            location
        });

        await department.save();

        res.status(201).json({
            message: "Department Added Successfully",
            department
        });

    } catch (error) {
        res.status(500).json({
            message: "Error Adding Department",
            error: error.message
        });
    }
};

// 2. Get All Departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();

        res.status(200).json(departments);

    } catch (error) {
        res.status(500).json({
            message: "Error Fetching Departments",
            error: error.message
        });
    }
};

// 3. Update Department
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({
                message: "Department Not Found"
            });
        }

        res.status(200).json({
            message: "Department Updated Successfully",
            department
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Updating Department",
            error: error.message
        });
    }
};

// 4. Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({
                message: "Department Not Found"
            });
        }

        res.status(200).json({
            message: "Department Deleted Successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Deleting Department",
            error: error.message
        });
    }
};

module.exports = {
    addDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
};