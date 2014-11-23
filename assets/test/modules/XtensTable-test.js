var expect = chai.expect;
var XtensTable = xtens.module("xtenstable");
var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;

/* a list of data (**stars**) for testing purposes */
var testData = [
    {
    id: 3,
    type: {
        id: 5,
        "name": "Star",
        "classTemplate": "Generic",
        "schema": {}
    },
    tags: null,
    notes: null,
    metadata: {
        "name":{"value":["Aldebaran"],"unit":[null]},
        "constellation":{"value":["Taurus"],"unit":[null]},
        "type":{"value":["giant"],"unit":[null]},
        "radius":{"value":[44.2],"unit":["R☉"]},
        "mass":{"value":[1.7],"unit":["M☉"]},
        "temperature":{"value":[3910],"unit":["K"]},
        "designation":{"value":["Alpha Tauri","87 Tauri","SAO 94027","Borgil"],"unit":[null,null,null,null],"loop":"Other designantions"},
        "planet":{"value":[null],"unit":[null],"loop":"Companions"},"companion_name":{"value":[null],"unit":[null],"loop":"Companions"},"companion_radius":{"value":[null],"unit":["km"],"loop":"Companions"},"companion_distance":{"value":[null],"unit":["AU"],"loop":"Companions"}
    }
},
{
    id: 4,
    type: {
        id: 5,
        "name": "Star",
        "classTemplate": "Generic",
        "schema": {}
    },
    tags: ["test", "second element"],
    notes: "yet another test",
    metadata: {
        "name":{"value":["Betelgeuse"],"unit":[null]},
        "constellation":{"value":["Orion"],"unit":[null]},
        "type":{"value":["giant"],"unit":[null]},
        "radius":{"value":[950],"unit":["R☉"]},
        "mass":{"value":[7.7],"unit":["M☉"]},
        "temperature":{"value":[3140],"unit":["K"]},
        "designation":{"value":["Alpha Orionis","58 Ori","SAO 113271","Borgil"],"unit":[null,null,null,null],"loop":"Other designantions"},
        "planet":{"value":[null],"unit":[null],"loop":"Companions"},"companion_name":{"value":[null],"unit":[null],"loop":"Companions"},"companion_radius":{"value":[null],"unit":["km"],"loop":"Companions"},"companion_distance":{"value":[null],"unit":["AU"],"loop":"Companions"}  
    }
}
];

/* a list of subjects for testing purposes */
var testSubjects = [
    {
    "projects":[{"name":"Fat","description":"Fat","id":3,"createdAt":"2014-10-15T17:08:15.000Z","updatedAt":"2014-10-15T17:08:15.000Z"}],
    "personalInfo":{
        "surname":"Clausi",
        "sex":"M",
        "id":1,
        "givenName":"Clausius",
        "birthDate":"2000-12-29T23:00:00.000Z"
    },
    "type":{
        "name":"Patient",
        "id":1,
        "classTemplate":"Subject"
    },
    "code":"PAT001",
    "tags":["test"],
    "notes":"bao miao ciao",
    "metadata":{
        "diagnosis_age":{"value":[1203],"unit":["days"]},
        "overall_status":{"value":["Diseased"],"unit":[null]}
    },
    "id":1
},{
    "projects":[{"name":"Neuroblastoma","description":"Neuroblastoma","id":1,"createdAt":"2014-10-15T16:59:21.000Z","updatedAt":"2014-10-15T16:59:21.000Z"}],
    "personalInfo":{
        "surname":"Marcellibus",
        "sex":"F",
        "id":2,
        "givenName":"Marcellina",
        "birthDate":"2013-12-07T23:00:00.000Z"
    },
    "type":{
        "name":"Patient",
        "id":1,
        "classTemplate":"Subject"
    },
    "code":"PAT002",
    "tags":["test","nb"],
    "notes":"nada",
    "metadata":{
        "diagnosis_age":{"value":[305],"unit":["days"]},
        "overall_status":{"value":["Diseased"],"unit":[null]}
    },
    "id":2
}
]; 

describe("XtensDataTable.DataTables", function() {

    describe("#prepareDataForRendering", function() {

        beforeEach(function() {
            this.dataTable = new XtensTable.Views.DataTable();
            this.keys = [];
            this.metadataFieldNoLoop = _.filter(testData[0].metadata, function(field, key) { 
                if (!field.loop) {
                    this.keys.push(key);
                }
                return !field.loop; 
            }, this); // filter all fields that are in a loop
        });

        it("should correctly prepare the headers for a generic data (e.g. a star)", function() {
            this.dataTable.prepareDataForRendering(testData);
            var tableOpts = this.dataTable.tableOpts;
            expect(tableOpts).not.to.be.empty;
            expect(tableOpts.data).to.be.an.instanceof(Array);
            expect(tableOpts.data).to.have.length(testData.length);
            expect(tableOpts.columns).to.be.an.instanceof(Array);
            var expectedCollLen = _.reduce(this.metadataFieldNoLoop, function(prevLen, field) { 
                return prevLen + Object.keys(field).length; 
            }, 0);
            expect(tableOpts.columns).to.have.length(expectedCollLen);
            var keys = this.keys;
            for (var i=0, j=0; i<keys.length; i++) {
                expect(tableOpts.columns[j].title).to.equal(replaceUnderscoreAndCapitalize(keys[i]));
                expect(tableOpts.columns[j++].data).to.equal('metadata.' + keys[i] + '.value.0');
                if (testData[0].metadata[keys[i]].unit) {
                   expect(tableOpts.columns[j++].data).to.equal('metadata.' + keys[i] + '.unit.0');
                }
            }
        });

    });

});
