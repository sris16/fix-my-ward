import Citizen from "../models/Citizen.js";

/* =========================
   REGISTER CITIZEN
========================= */

export const registerCitizen = async (req, res) => {

try {

const { name, mobile } = req.body;

let citizen = await Citizen.findOne({ mobile });

if (!citizen) {

citizen = new Citizen({
name,
mobile
});

await citizen.save();

}

res.json(citizen);

} catch (error) {

res.status(500).json({ message: error.message });

}

};


/* =========================
   GET CITIZEN
========================= */

export const getCitizen = async (req, res) => {

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