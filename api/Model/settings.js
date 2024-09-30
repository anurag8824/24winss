// const mongoose = require("mongoose")

// const SiteSettingsSchema = new mongoose.Schema({
//     WebTitle:{
//         type: String,
//         default: null
//     },
//     WebsiteName: {
//         type: String,
//         default: null
//     },
//     CompanyName: {
//         type: String,
//         default: null
//     },
//     CompanyMobile: {
//         type: String,
//         default: null
//     },
//     CompanyEmail: {
//         type: String,
//         default: null
//     },
//     CompanyWebsite: {
//         type: String,
//         default: null
//     },
    
//     homeMsg: {
//         type: String,
//         default: null
//     },
//     gameMsg: {
//         type: String,
//         default: null
//     },
//     withdrawMsg: {
//         type: String,
//         default: null
//     },
//     depositMsg: {
//         type: String,
//         default: null
//     },
    
//     CompanyAddress: {
//         type: String,
//         default: null
//     },
//     Logo: {
//         type: String,
//         default: null
//     },
//     SmallLogo: {
//         type: String,
//         default: null
//     },
//     LandingImage1: {
//         type: String,
//         default: null
//     },
//     LandingImage2: {
//         type: String,
//         default: null
//     },
//     LandingImage3: {
//         type: String,
//         default: null
//     },
//     LandingImage4: {
//         type: String,
//         default: null
//     },
//     isLandingImage1: {
//         type: Boolean,
//         default: false
//     },
//     isLandingImage2: {
//         type: Boolean,
//         default: false
//     },
//     isLandingImage3: {
//         type: Boolean,
//         default: false
//     },
//     isLandingImage4: {
//         type: Boolean,
//         default: false
//     },
//     version: {
//         type: String,
//         default: null
//     },
// })

// const SiteSettings = mongoose.model("SiteSettings",SiteSettingsSchema)
// module.exports = SiteSettings


const mongoose = require("mongoose");

const SiteSettingsSchema = new mongoose.Schema({
    WebTitle: {
        type: String,
        default: null
    },
    WebsiteName: {
        type: String,
        default: null
    },
    CompanyName: {
        type: String,
        default: null
    },
    CompanyMobile: {
        type: String,
        default: null
    },
    CompanyEmail: {
        type: String,
        default: null
    },
    CompanyWebsite: {
        type: String,
        default: null
    },
    homeMsg: {
        type: String,
        default: null
    },
    gameMsg: {
        type: String,
        default: null
    },
    withdrawMsg: {
        type: String,
        default: null
    },
    depositMsg: {
        type: String,
        default: null
    },
    CompanyAddress: {
        type: String,
        default: null
    },
    Logo: {
        type: String,
        default: null
    },
    SmallLogo: {
        type: String,
        default: null
    },
    LandingImage1: {
        type: String,
        default: null
    },
    LandingImage2: {
        type: String,
        default: null
    },
    LandingImage3: {
        type: String,
        default: null
    },
    LandingImage4: {
        type: String,
        default: null
    },
    CarouselImage1: {
        type: String,
        default: null
    },
    CarouselImage2: {
        type: String,
        default: null
    },
    CarouselImage3: {
        type: String,
        default: null
    },
    version: {
        type: String,
        default: null
    }
});

const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);
module.exports = SiteSettings;
