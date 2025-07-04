const cron = require("node-cron")
const aidietplan = require("../model/aidietplan")
cron.schedule("0 0 * * *", async () => {
  try {
    const dietplans = await aidietplan.find();

    for (const dietplan of dietplans) {
      const created = new Date(dietplan.createddata);
      let expiryDate = new Date(created);

      // Calculate expiration based on durationUnit
      switch (dietplan.durationUnit) {
        case "day":
          expiryDate.setDate(expiryDate.getDate() + dietplan.duration);
          break;
        case "week":
          expiryDate.setDate(expiryDate.getDate() + dietplan.duration * 7);
          break;
        case "month":
          expiryDate.setMonth(expiryDate.getMonth() + dietplan.duration);
          break;
        case "year":
          expiryDate.setFullYear(expiryDate.getFullYear() + dietplan.duration);
          break;
      }

      // Compare expiration with current time
      if (Date.now() > expiryDate.getTime()) {
        await aidietplan.findByIdAndDelete(dietplan._id);
        console.log(`🗑️ Deleted expired schedule for: ${dietplan.memberusername}`);
      }
    }
  } catch (error) {
    console.error("❌ Error in schedule cleanup cron job:", error);
  }
});