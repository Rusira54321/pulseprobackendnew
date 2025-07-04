const cron = require("node-cron")
const aischedule = require("../model/aischedule")
cron.schedule("0 0 * * *", async () => {
  try {
    const schedules = await aischedule.find();

    for (const schedule of schedules) {
      const created = new Date(schedule.createddata);
      let expiryDate = new Date(created);

      // Calculate expiration based on durationUnit
      switch (schedule.durationUnit) {
        case "day":
          expiryDate.setDate(expiryDate.getDate() + schedule.duration);
          break;
        case "week":
          expiryDate.setDate(expiryDate.getDate() + schedule.duration * 7);
          break;
        case "month":
          expiryDate.setMonth(expiryDate.getMonth() + schedule.duration);
          break;
        case "year":
          expiryDate.setFullYear(expiryDate.getFullYear() + schedule.duration);
          break;
      }

      // Compare expiration with current time
      if (Date.now() > expiryDate.getTime()) {
        await aischedule.findByIdAndDelete(schedule._id);
        console.log(`🗑️ Deleted expired schedule for: ${schedule.memberusername}`);
      }
    }
  } catch (error) {
    console.error("❌ Error in schedule cleanup cron job:", error);
  }
});