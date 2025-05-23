
// /get /api/user

export const getUserData = async (req, res)=>{
    try {
        const role = req.user.role;
        const recentSearchCites = req.user.recentSearchedCites;
        res.json({success: true, role, recentSearchCites})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// store user recent searched cites
export const storeRecentSearchedCities = async (req , res)=>{
    try {
       const {recentSearchedCity}  = req.body;
       const user = await req.user;
        
       if (user.recentSearchedCities.length < 3) {
        user.recentSearchedCities.push(recentSearchedCity)
       }else{
        user.recentSearchedCites.shift();
        user.recentSearchedCities.push(recentSearchedCity);
       }
       await user.save();
       res.json({success: true, message: "City Added"})
    } catch (error) {
         res.json({success: false, message: error.message})
    }
}