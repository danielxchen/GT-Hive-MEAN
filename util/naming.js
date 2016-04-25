// Script to rename buildings in the database

mapping = {
    "300": "Alpha Epsilon Pi",
    "302": "Alpha Tau Omega",
    "303": "Beta Theta Pi",
    "304": "Chi Phi",
    "305": "Chi Psi",
    "307": "Delta Sigma Phi",
    "308": "Delta Tau Delta",
    "309": "Delta Upsilon",
    "310": "Kappa Alpha",
    "311": "Kappa Sigma",
    "312": "Lambda Chi Alpha",
    "314": "Phi Delta Theta",
    "315": "Phi Gamma Delta",
    "316": "Phi Kappa Sigma",
    "317": "Phi Kappa Tau",
    "318": "Phi Kappa Theta",
    "319": "Phi Sigma Kappa",
    "320": "Pi Kappa Alpha",
    "321": "Psi Upsilon",
    "322": "Alpha Xi Delta",
    "323": "Sigma Alpha Epsilon",
    "324": "Sigma Chi",
    "325": "Sigma Nu",
    "326": "Sigma Phi Epsilon",
    "327": "Tau Kappa Epsilon",
    "328": "Theta Chi",
    "330": "Zeta Beta Tau",
    "331": "Alpha Chi Omega",
    "333": "Alpha Gamma Delta",
    "334": "Alpha Delta Pi",
    "335": "Delta Chi",
    "336": "Pi Kappa Phi",
    "337": "Alpha Delta Chi",
    "850": "Engineering Center",
    "865": "EII 512 Means St",
    "100": "Crosland Tower",
    "101": "Montgomery-Knight Building",
    "103": "Boggs Building",
    "104": "Wenn Student Center",
    "105": "Commander Building",
    "106": "Fulmer Residence Hall",
    "107": "Hefner Residence Hall",
    "108": "Armstrong Residence Hall",
    "109": "Caldwell Residence Hall",
    "110": "Folk Residence Hall",
    "111": "Mason Civil Engineering Building",
    "115": "Couch Building",
    "117": "Freemen Residence Hall",
    "118": "Montag Residence Hall",
    "119": "Fitten Residence Hall",
    "123": "Smithgall Student Services Building",
    "124": "Ferst Center for the Arts",
    "126": "Manufacturing Research Center - (MARC)",
    "128": "Center for Assistive Technology and Environmental Access",
    "129": "Institute of Paper Science and Technology",
    "131": "Hemphill Avenue Apartments",
    "134": "Jack C. Stein House (Fourth St)",
    "136": "GTRI (Callaway Building)",
    "137": "Ivan Allen College (Habersham)",
    "138": "Office of Information Technology",
    "139": "Curran St Parking Deck",
    "142": "Office of Human Resources",
    "144": "J. Erskine Love Manufacturing Building",
    "145": "Lamar Allen Sustainable Education Building",
    "146": "Parker H. Petit Biotechnology Building (IBB)",
    "147": "Ford Motor Company Environmental Science and Technology (ES&T)",
    "149": "Structural Engineering and Materials Research",
    "151": "Aerospace Engineering Combustion Lab",
    "152": "Broadband Institute Residential Laboratory, Aware Home",
    "155": "Research Administration",
    "156": "Office of Information Technology (OIT)",
    "158": "Advanced Wood Products",
    "164": "Business Services",
    "165": "UA Whitaker Building",
    "167": "Molecular Science and Engineering (MoSE or MSE)",
    "170": "Global Learning & Conference Center",
    "171": "Georgia Tech Hotel and Conference Center",
    "172": "College of Management and Barnes & Noble Bookstore",
    "173": "Economic Development Building (EDB)",
    "174": "Technology Square Parking Deck",
    "175": "Technology Square Research Building",
    "176": "Centergy One",
    "177": "Student Health Center",
    "178": "Health Systems Institute",
    "181": "Marcus Nanotechnology",
    "184": "831 Marietta St.",
    "198": "Academy of Medicine",
    "200": "Brock Mary R. & John F. Football Practice Facility",
    "201": "Challenge Course Pavilion",
    "720": "Paul Heffernan House",
    "338": "Zeta Tau Alpha",
};

var mongoose   = require('mongoose');
var Building = require('./app/models/building');
var database = 'mongodb://admin:password@ds035623.mlab.com:35623/gt_hive';

var Promise = require('bluebird');
Promise.promisifyAll(Building);
Promise.promisifyAll(Building.prototype);

// Connect to database
mongoose.connect(database); 

for (var bid in mapping) {
    Building.findOneAndUpdateAsync({ bid: bid }, { $set: { name: mapping[bid] } }, { new: true }).then(function(doc) {
        console.log('doc', doc);
    });

    console.log('updated ', bid, ' ', mapping[bid]);
}
