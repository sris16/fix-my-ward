import Issue from "../models/Issue.js";
import calculatePriority from "../utils/calculatePriority.js";


// 📝 Create Issue (with duplicate detection + priority)
export const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      latitude, // Fallback for backwards compatibility
      longitude, // Fallback for backwards compatibility
      lat,      // New spec payload
      lng,      // New spec payload
      locationText,
      images,   // Fallback
      photos,   // New spec payload
      forceSubmit,
    } = req.body;

    // Map new spec to internal variables
    const finalLat = lat !== undefined ? lat : latitude;
    const finalLng = lng !== undefined ? lng : longitude;
    const finalImages = photos && photos.length > 0 ? photos : (images || []);

    // ✅ Validate location
    if (finalLat === undefined || finalLng === undefined) {
      return res.status(400).json({ message: "Location is required" });
    }

    // 🔍 Find nearby issues (same category within 300m)
    const nearbyIssues = await Issue.find({
      category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [finalLng, finalLat],
          },
          $maxDistance: 300,
        },
      },
    });

    // 🚫 Suggest duplicates instead of creating, UNLESS forceSubmit is true
    if (nearbyIssues.length > 0 && !forceSubmit) {
      return res.status(200).json({
        message: "Similar issues found nearby. Consider upvoting.",
        suggestions: nearbyIssues,
      });
    }

    // 🧠 Calculate initial priority
    const priority = calculatePriority(0, nearbyIssues.length);

    // 📝 Create new issue
    const issue = await Issue.create({
      title,
      description,
      category,
      location: {
        type: "Point",
        coordinates: [finalLng, finalLat],
      },
      locationText,
      images: finalImages,
      reportedBy: req.user._id,
      priority,
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📋 Get all issues (with optional location filtering)
export const getIssues = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    let query = {};

    if (lat && lng) {
      const maxDistance = radius ? parseInt(radius) : 10000; // default 10km

      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: maxDistance,
        },
      };
    }

    // Note: To use .sort() conditionally, we apply it afterwards
    let result = Issue.find(query).populate("reportedBy", "name email");
    
    // Only sort if we are NOT using $near, because $near automatically sorts by distance
    if (!lat || !lng) {
        result = result.sort({ createdAt: -1 });
    }

    const finalIssues = await result;

    res.json(finalIssues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 👤 Get my issues
export const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ⭐ Toggle Upvote + Update Priority
export const toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const userId = req.user._id;

    // 🔁 Toggle upvote
    const alreadyUpvoted = issue.upvotes.includes(userId);

    if (alreadyUpvoted) {
      issue.upvotes = issue.upvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      issue.upvotes.push(userId);
    }

    // 🔍 Find nearby issues for density
    const nearbyIssues = await Issue.find({
      category: issue.category,
      location: {
        $near: {
          $geometry: issue.location,
          $maxDistance: 300,
        },
      },
    });

    // 🧠 Recalculate priority
    issue.priority = calculatePriority(
      issue.upvotes.length,
      nearbyIssues.length
    );

    // 💾 Save changes
    await issue.save();

    res.json({
      message: alreadyUpvoted ? "Upvote removed" : "Upvoted",
      totalUpvotes: issue.upvotes.length,
      priority: issue.priority,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};