

const { cloudinary, makeFilePublic } = require("../utils/cloudinary");
const Ipo = require("../models/Ipo");
const path = require('path');
const sendApprovalEmail = require("../utils/sendEmail");

exports.createIPO = async (req, res) => {
  try {
    const {
      owner_name,
      contact_no,
      email,
      land_size,
      land_cost_per_share,
      available_shares,
      total_shares,
      address,
      facilities,
    } = req.body;

    const files = req.files;

    const unlockIfPdf = async (field) => {
      if (!files[field]) return null;

      const file = files[field][0];
      const fileUrl = file.path;
      const rawFileName = file.filename; // filename without folder
  const ext = path.extname(rawFileName).toLowerCase();

  if (ext === '.pdf') {
    const publicId = `landshare_docs/${rawFileName}`; // prepend folder name
    await makeFilePublic(publicId);
  }


      return fileUrl;
    };

    const aadharUrl = await unlockIfPdf("aadhar");
    const landDocUrl = await unlockIfPdf("land_doc");
    const signatureUrl = await unlockIfPdf("signature");
    const photoUrl = await unlockIfPdf("photo");

    const availableShares = req.body.available_shares;
const totalShares = availableShares;
    const newIpo = await Ipo.create({
      ownerName: owner_name,
      contactNo: contact_no,
      email,
      landSize: land_size,
      shareCost: parseFloat(land_cost_per_share),
      availableShares: parseFloat(available_shares),
      totalShares: parseFloat(totalShares),
      address,
      features: facilities,
      aadharUrl,
      landDocUrl,
      signatureUrl,
      photoUrl,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, newIpo });
  } catch (error) {
    console.error("Error creating IPO:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getApprovedIPOs = async (req, res) => {
  try {
    const ipos = await Ipo.findAll({ where: { approved: true } });
    res.status(200).json(ipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch approved IPOs" });
  }
};

exports.getPendingIPOs = async (req, res) => {
  try {
    const ipos = await Ipo.findAll({ where: { approved: false } });
    res.status(200).json(ipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending IPOs" });
  }
};

exports.getAllIPOs = async (req, res) => {
  try {
    const ipos = await Ipo.findAll();
    res.status(200).json(ipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch IPOs" });
  }
};


exports.approveIPO = async (req, res) => {
  try {
    const { id } = req.params;

    const ipo = await Ipo.findByPk(id);
    if (!ipo) return res.status(404).json({ error: "IPO not found" });

    ipo.approved = true;
    await ipo.save();

    await sendApprovalEmail(
      ipo.email,
      "Your LandShare IPO Has Been Approved 🎉",
      "IPO Approved ✅",
      `Hello ${ipo.ownerName},<br><br>
       We’re excited to inform you that your IPO <strong>${ipo.address}</strong> has been approved and is now live on LandShare.<br><br>
       Investors can now start buying shares!`,
      "Thank you for using LandShare."
    );

    res.status(200).json({ success: true, message: "IPO approved & email sent", ipo });
  } catch (error) {
    console.error("Error approving IPO:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.declineIPO = async (req, res) => {
  try {
    const { id } = req.params;

    const ipo = await Ipo.findByPk(id);
    if (!ipo) return res.status(404).json({ error: "IPO not found" });

    await sendApprovalEmail(
      ipo.email,
      "Your LandShare IPO Has Been Declined ❌",
      "IPO Declined",
      `Hello ${ipo.ownerName},<br><br>
       We regret to inform you that your IPO <strong>${ipo.address}</strong> was not approved after review.<br><br>
       Please review the submission details and try again.`,
      "Thank you for using LandShare."
    );

    await ipo.destroy();

    res.status(200).json({ success: true, message: "IPO declined & email sent" });
  } catch (error) {
    console.error("Error declining IPO:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
