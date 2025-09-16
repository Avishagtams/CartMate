const express = require("express");
const requireAuth = require("../middleware/auth");
const List = require("../models/List");
const User = require("../models/User");

const router = express.Router();

// ✅ בדיקה אם משתמש קיים לפי טלפון
router.get("/check/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    const user = await User.findOne({ phone }).select("_id name email phone");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ יצירת רשימה חדשה
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, sharedWith } = req.body;

    if (!name) return res.status(400).json({ msg: "Missing list name" });

    // המרת מספרי טלפון ל־ObjectId
    let sharedUsers = [];
    if (sharedWith && sharedWith.length > 0) {
      const users = await User.find({ phone: { $in: sharedWith } }).select("_id");
      if (users.length !== sharedWith.length) {
        return res.status(400).json({ msg: "One or more phone numbers are not registered users" });
      }
      sharedUsers = users.map(u => u._id);
    }

    const list = await List.create({
      name,
      owner: req.userId,
      sharedWith: sharedUsers
    });

    res.status(201).json(list);
  } catch (err) {
    console.error("Create list error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ שליפת רשימה לפי מזהה
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate("owner", "name email phone")
      .populate("sharedWith", "name email phone");

    if (!list) return res.status(404).json({ msg: "List not found" });

    // רק הבעלים או שותפים יכולים לגשת
    if (
      list.owner._id.toString() !== req.userId &&
      !list.sharedWith.some((u) => u._id.toString() === req.userId)
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    res.json(list);
  } catch (err) {
    console.error("Get list error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ סימון פריט כנקנה/לא נקנה
router.put("/:id/toggle/:itemId", requireAuth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) return res.status(404).json({ msg: "List not found" });

    if (
      list.owner.toString() !== req.userId &&
      !list.sharedWith.some((id) => id.toString() === req.userId)
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: "Item not found" });

    item.done = !item.done;
    await list.save();

    res.json(list);
  } catch (err) {
    console.error("Toggle item error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ הוספת משתמשים לרשימה קיימת (שיתוף)
router.put("/:id/add-users", requireAuth, async (req, res) => {
  try {
    const { phones } = req.body;
    if (!phones || phones.length === 0) {
      return res.status(400).json({ msg: "No phone numbers provided" });
    }

    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ msg: "List not found" });

    // רק הבעלים יכול להוסיף משתמשים
    if (list.owner.toString() !== req.userId) {
      return res.status(403).json({ msg: "Only the owner can add users" });
    }

    const users = await User.find({ phone: { $in: phones } }).select("_id");
    if (users.length !== phones.length) {
      return res.status(400).json({ msg: "One or more phone numbers are not registered users" });
    }

    users.forEach((u) => {
      if (!list.sharedWith.includes(u._id)) {
        list.sharedWith.push(u._id);
      }
    });

    await list.save();
    const updated = await List.findById(list._id)
      .populate("owner", "name email phone")
      .populate("sharedWith", "name email phone");

    res.json(updated);
  } catch (err) {
    console.error("Add users error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
