const cron = require("node-cron")
const workout = require("../model/WorkOutPlan")
cron.schedule("0 0 * * *",async()=>{
    const matchworkouts = await workout.find()
    if(matchworkouts)
    {
    for(const workouts of matchworkouts)
        {
            if(Date.now()>workouts.expiredAt)
            {
                    await workout.findByIdAndDelete(workouts._id)
            }
        }
    }    
})