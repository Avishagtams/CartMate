const express = require("express");
const requireAuth = require("../middleware/auth");
const List = require("../models/List");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");

const router = express.Router();

// ✅ בדיקה אם משתמש קיים לפי טלפון
router.get("/check/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    const user = await User.findOne({ phone }).select("_id name email phone");
    if (!user) {
      return res.status(404).json({ msg: "משתמש עם מספר הטלפון הזה לא נמצא במערכת" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "שגיאה בשרת, נסי שוב מאוחר יותר" });
  }
});

// ✅ יצירת רשימה חדשה
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, sharedWith } = req.body;

    if (!name) return res.status(400).json({ msg: "חובה להזין שם לרשימה" });

    // המרת מספרי טלפון ל־ObjectId
    let sharedUsers = [];
    if (sharedWith && sharedWith.length > 0) {
      const users = await User.find({ phone: { $in: sharedWith } }).select("_id");
      if (users.length !== sharedWith.length) {
        return res.status(400).json({ msg: "חלק ממספרי הטלפון שהוזנו אינם רשומים במערכת" });
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
    console.error("שגיאה ביצירת רשימה:", err);
    res.status(500).json({ error: "שגיאה ביצירת רשימה" });
  }
});

// ✅ שליפת רשימה לפי מזהה
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate("owner", "name email phone")
      .populate("sharedWith", "name email phone");

    if (!list) return res.status(404).json({ msg: "הרשימה לא נמצאה" });

    // רק הבעלים או שותפים יכולים לגשת
    if (
      list.owner._id.toString() !== req.userId &&
      !list.sharedWith.some((u) => u._id.toString() === req.userId)
    ) {
      return res.status(403).json({ msg: "אין לך הרשאה לגשת לרשימה זו" });
    }

    res.json(list);
  } catch (err) {
    console.error("שגיאה בשליפת רשימה:", err);
    res.status(500).json({ error: "שגיאה בטעינת הרשימה" });
  }
});

// ✅ סימון פריט כנקנה/לא נקנה
router.put("/:id/toggle/:itemId", requireAuth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) return res.status(404).json({ msg: "הרשימה לא נמצאה" });

    if (
      list.owner.toString() !== req.userId &&
      !list.sharedWith.some((id) => id.toString() === req.userId)
    ) {
      return res.status(403).json({ msg: "אין לך הרשאה לעדכן פריטים ברשימה זו" });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: "הפריט לא נמצא ברשימה" });

    item.done = !item.done;
    await list.save();

    res.json(list);
  } catch (err) {
    console.error("שגיאה בעדכון פריט:", err);
    res.status(500).json({ error: "שגיאה בעדכון פריט ברשימה" });
  }
});

// ✅ הוספת משתמשים לרשימה קיימת (שיתוף)
router.put("/:id/add-users", requireAuth, async (req, res) => {
  try {
    const { phones } = req.body;
    if (!phones || phones.length === 0) {
      return res.status(400).json({ msg: "לא נשלחו מספרי טלפון" });
    }

    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ msg: "הרשימה לא נמצאה" });

    // רק הבעלים יכול להוסיף משתמשים
    if (list.owner.toString() !== req.userId) {
      return res.status(403).json({ msg: "רק בעל הרשימה יכול להוסיף משתמשים" });
    }

    const users = await User.find({ phone: { $in: phones } }).select("_id");
    if (users.length !== phones.length) {
      return res.status(400).json({ msg: "מספר הטלפון שהוזן אינו רשום במערכת" });
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
    console.error("שגיאה בהוספת משתמשים לרשימה:", err);
    res.status(500).json({ error: "שגיאה בהוספת משתמשים לרשימה" });
  }
});

// ✅ הוספת מוצר חדש לרשימה
router.post("/:id/items", requireAuth, async (req, res) => {
  try {
    const { name, quantity } = req.body;

    if (!name) return res.status(400).json({ msg: "חובה להזין שם מוצר" });
    if (quantity && quantity <= 0) {
      return res.status(400).json({ msg: "כמות חייבת להיות מספר גדול מ-0" });
    }

    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ msg: "הרשימה לא נמצאה" });

    // רק הבעלים או שותפים יכולים להוסיף מוצרים
    if (
      list.owner.toString() !== req.userId &&
      !list.sharedWith.some((id) => id.toString() === req.userId)
    ) {
      return res.status(403).json({ msg: "אין לך הרשאה להוסיף מוצרים לרשימה זו" });
    }

    // הוספת המוצר
    list.items.push({
      name,
      quantity: quantity || 1,
      done: false,
    });

    await list.save();

    const updated = await List.findById(list._id)
      .populate("owner", "name email phone")
      .populate("sharedWith", "name email phone");

    res.json(updated);
  } catch (err) {
    console.error("שגיאה בהוספת מוצר:", err);
    res.status(500).json({ error: "שגיאה בהוספת מוצר לרשימה" });
  }
});

// עדכון מוצר קיים ברשימה
router.put("/:id/items/:itemId", requireAuth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { name, quantity } = req.body;

    const list = await List.findById(id);
    if (!list) return res.status(404).json({ msg: "רשימה לא נמצאה" });

    const item = list.items.id(itemId);
    if (!item) return res.status(404).json({ msg: "פריט לא נמצא" });

    if (name) item.name = name;
    if (quantity) item.quantity = quantity;

    await list.save();
    res.json(list);
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ error: err.message });
  }
});

// מחיקת מוצר ספציפי מהרשימה
router.delete("/:listId/items/:itemId", requireAuth, async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    // מוצאים את הרשימה
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ msg: "הרשימה לא נמצאה" });
    }

    // מסננים את המוצר החוצה
    list.items = list.items.filter((item) => item._id.toString() !== itemId);

    // שמירה
    await list.save();

    res.json(list); // מחזירים את הרשימה המעודכנת
  } catch (err) {
    res.status(500).json({ msg: "שגיאה במחיקת מוצר", error: err.message });
  }
});

// ✅ התחלת נעילה ושליחת מייל לכל המשתתפים
router.post("/:id/lock", requireAuth, async (req, res) => {
  try {
    const { minutes } = req.body;
    const mins = Number(minutes);
    if (!mins || mins <= 0) return res.status(400).json({ msg: "מספר דקות לא תקין" });

    const list = await List.findById(req.params.id)
      .populate("owner", "name email phone")
      .populate("sharedWith", "name email phone");

    if (!list) return res.status(404).json({ msg: "List not found" });

    if (
      list.owner._id.toString() !== req.userId &&
      !list.sharedWith.some((u) => u._id.toString() === req.userId)
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const now = new Date();

    if (list.lockUntil && list.lockUntil > now) {
      const at = list.lockUntil.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      return res.status(409).json({ msg: `הרשימה כבר נעולה עד ${at}` });
    }

    const lockUntil = new Date(now.getTime() + mins * 60000);
    list.lockUntil = lockUntil;
    list.lockNotifiedAt = now;

    const emails = [list.owner?.email, ...list.sharedWith.map(u => u?.email)].filter(Boolean);

    if (emails.length > 0) {
      const humanTime = lockUntil.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    
      const listName = list.name || "ללא שם";
    
      await sendMail({
        to: emails,
        subject: `CartMate 🛒 - הרשימה "${listName}" תינעל בעוד ${mins} דקות!`,
        text: `הרשימה "${listName}" תינעל בעוד ${mins} דקות (בשעה ${humanTime}). זה הזמן להוסיף פריטים.`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;">
            <h2>📢 הרשימה "<strong>${listName}</strong>" תינעל בעוד ${mins} דקות</h2>
            <p>בשעה <strong>${humanTime}</strong> תינעל הרשימה שלך באפליקציית CartMate.</p>
            <p>אם יש לך פריטים להוסיף — עכשיו הזמן!</p>
          </div>
        `
      });
    }
    
   

    await list.save();
    res.json({ msg: `הרשימה תינעל בעוד ${mins} דקות. נשלח מייל לכל המשתתפים.`, lockUntil });
  } catch (err) {
    console.error("Lock list error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ שליחת מייל כשמתחילים קניות
router.post("/:id/start-shopping", requireAuth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate("sharedWith", "email name");

    if (!list) return res.status(404).json({ msg: "List not found" });

    if (list.owner.toString() !== req.userId) {
      return res.status(403).json({ msg: "Only the owner can start shopping" });
    }

    const emails = list.sharedWith.map(u => u.email).filter(Boolean);
    if (emails.length === 0) {
      return res.status(400).json({ msg: "No email addresses found" });
    }

    const subject = "🚨 CartMate – יוצאים לקניות!";
    const message = `שלום,\n\nהמשתמש שלך יוצא כעת לקניות עבור הרשימה \"${list.name}\".\n\nהיכנסו לאפליקציה כדי לעקוב.`;

    await sendMail({
      to: emails,
      subject,
      text: message,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;"><h2>${subject}</h2><p>${message.replace("\n", "<br>")}</p></div>`
    });

    res.json({ msg: "Email sent" });
  } catch (err) {
    console.error("Start shopping error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
