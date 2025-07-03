const cron = require("node-cron");
const mongoose = require("mongoose");
const Class = require("../model/Class"); // Update path as needed

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date(); // current date and time

    // Fetch all classes from the database
    const allClasses = await Class.find();

    for (const classItem of allClasses) {
      // Split date from format "YYYY-MM-DD"
      const [year, month, day] = classItem.date.split("-"); // ✅ Fixed order
      const classEnd = new Date(`${year}-${month}-${day}T${classItem.endTime}`);

      // Compare current time with class end time
      if (now > classEnd) {
        await Class.deleteOne({ _id: classItem._id });
        console.log(`✅ Deleted expired class: ${classItem.classname} scheduled on ${classItem.date} till ${classItem.endTime}`);
      }
    }
  } catch (error) {
    console.error("❌ Error deleting expired classes:", error);
  }
});