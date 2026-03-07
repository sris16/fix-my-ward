const Citizen = require("../models/Citizen");

// Register Citizen
exports.registerCitizen = async (req, res) => {

try {

const { name, mobile, email } = req.body;

let citizen = await Citizen.findOne({ mobile });

if (citizen) {
return res.json(citizen);
}

citizen = new Citizen({
name,
mobile,
email
});

await citizen.save();

res.status(201).json(citizen);

} catch (error) {

res.status(500).json({ message: error.message });

}

};


// Get Citizen by Mobile
exports.getCitizen = async (req, res) => {

try {

const citizen = await Citizen.findOne({
mobile: req.params.mobile
});

if (!citizen) {
return res.status(404).json({ message: "Citizen not found" });
}

res.json(citizen);

} catch (error) {

res.status(500).json({ message: error.message });

}

};