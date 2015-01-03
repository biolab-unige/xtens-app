var expect = chai.expect;
var XtensTable = xtens.module("xtenstable");
var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;

/* the data type against whom we build the DataTable */
var testDataType = {
    "id": 1,
    "name": "Star",
    "schema": {"body":[{"name":"Generic Info","label":"METADATA GROUP","content":[{"name":"name","label":"METADATA FIELD","isList":false,"hasUnit":false,"hasRange":false,"required":true,"fieldType":"Text","sensitive":true,"customValue":null,"ontologyUri":null,"possibleUnits":null,"possibleValues":null},{"name":"constellation","label":"METADATA FIELD","isList":true,"hasUnit":false,"hasRange":false,"required":true,"fieldType":"Text","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":null,"possibleValues":["orion","taurus","N.A.","N.D.","scutum","canis major","cygnus"]},{"name":"classification","label":"METADATA FIELD","isList":true,"hasUnit":false,"hasRange":false,"required":true,"fieldType":"Text","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":null,"possibleValues":["hypergiant","supergiant","giant","subgiant","main-sequence star","subdwarf","dwarf"]},{"name":"Other Designations","label":"METADATA LOOP","content":[{"name":"designation","label":"METADATA FIELD","isList":false,"hasUnit":false,"hasRange":false,"required":true,"fieldType":"Text","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":null,"possibleValues":null}]}]},{"name":"Physical Details","label":"METADATA GROUP","content":[{"name":"mass","label":"METADATA FIELD","isList":false,"hasUnit":true,"hasRange":false,"required":true,"fieldType":"Float","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":["M☉"],"possibleValues":null},{"name":"radius","label":"METADATA FIELD","isList":false,"hasUnit":true,"hasRange":false,"required":true,"fieldType":"Float","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":["R☉"],"possibleValues":null},{"name":"luminosity","label":"METADATA FIELD","isList":false,"hasUnit":true,"hasRange":false,"required":false,"fieldType":"Integer","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":["L☉"],"possibleValues":null},{"name":"temperature","label":"METADATA FIELD","isList":false,"hasUnit":true,"hasRange":false,"required":false,"fieldType":"Integer","sensitive":false,"customValue":null,"ontologyUri":null,"possibleUnits":["K"],"possibleValues":null}]}],"header":{"version":"1.0","ontology":"","fileUpload":true,"schemaName":"Star","description":"A generic data type for a star","class_template":"Generic"}}
};

/* a list of data (**stars**) for testing purposes */
var testData = [
    {
    id: 3,
    type: {
        id: 5,
        "name": "Star",
        "classTemplate": "Generic",
        "schema": {
            // TODO add schema details or move schema somewhere else!! (better the second option)
        }
    },
    tags: null,
    notes: null,
    metadata: {
        "name":{"value":"Aldebaran"},
        "constellation":{"value":"Taurus"},
        "classification":{"value":"giant"},
        "mass":{"value":1.7,"unit":"M☉"},
        "radius":{"value":44.2,"unit":"R☉"},
        "luminosity":{"value":518,"unit":"L☉"},
        "temperature":{"value":3910,"unit":"K"},
        "designation":{"values":["Alpha Tauri","87 Tauri","SAO 94027","Borgil"],"loop":"Other designantions"},
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
        "name":{"value":"Betelgeuse"},
        "constellation":{"value":"Orion"},
        "classification":{"value":"giant"},
        "mass":{"value":7.7, "unit":"M☉"},
        "radius":{"value":950, "unit":"R☉"},
        "luminosity":{"value":135000,"unit":"L☉"},
        "temperature":{"value":3140,"unit":"K"},
        "designation":{"values":["Alpha Orionis","58 Ori","SAO 113271","Borgil"],"loop":"Other designantions"},
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
            this.dataTable.prepareDataForRendering(testData, testDataType);
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
                expect(tableOpts.columns[j++].data).to.equal('metadata.' + keys[i] + '.value');
                if (testData[0].metadata[keys[i]].unit) {
                   expect(tableOpts.columns[j++].data).to.equal('metadata.' + keys[i] + '.unit');
                }
            }
        });

    });

});
