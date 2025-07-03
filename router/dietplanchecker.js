const dietplan = require("../model/Dietplan")
const cron = require("node-cron")
cron.schedule("0 0 * * *",async()=>{
    const matchdietplans = await dietplan.find()
    if(matchdietplans)
    {
        for(const dietplans of matchdietplans)
        {
            if(Date.now()>dietplans.expiredAt)
            {
                await dietplan.findByIdAndDelete(dietplans._id)
            }
        }
    }
})