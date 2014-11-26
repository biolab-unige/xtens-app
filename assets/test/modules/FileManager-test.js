var expect = chai.expect;
var FileManager = xtens.module("FileManager").Irods;
describe("FileManager", function() {
    describe("constructor",function(){
        it("should create a new FileManager with a valid URI", function(){
            var uri = "http://10.186.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/biolab/";
            var fileManager = new FileManager(uri);
            expect(fileManager).to.exist;
            expect(fileManager.basePath).to.be.equal(uri);
        });
        /* it("should throw an error with a not valid URI", function(){
           var uri = "cfsgfuygiid";
           expect(function(){ new FileManager(uri);}).to.throw(new Error("Not valid URI"));
           });*/
    });
    describe(".upload()", function() {
        before(function() {
            this.fileManager = new FileManager("http://10.186.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/biolab/");
            this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });
        after(function(){
            this.xhr.restore();
        });
        it("should fire a post request to the correct uri", function(){
            var dest = "biolab.conf";
            var source = "/home/valentina/biolab.conf";
            var result = this.fileManager.upload("/home/valentina/biolab.conf",dest);
            var request = this.requests[0];
            expect(request.method).to.be.equal('POST');
            expect(request.url).to.be.equal(this.fileManager.basePath+dest);
            var file =request.requestBody ;
            expect(file).to.exist;
            expect(file).to.be.an.instanceof(FormData);
        });
    });
    describe(".download()", function() {
        before(function(){
            this.fileManager = new FileManager("http://10.186.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/biolab/");
            this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });
        after(function(){
            this.xhr.restore();
        });

        it("should fire a get request to correct uri", function(){
            var dest = "pippo.txt";
            var result = this.fileManager.download(dest);
            var request = this.requests[0];
            expect(request.method).to.be.equal('GET');
            expect(request.url).to.be.equal(this.fileManager.basePath+dest);
        });
    });
    describe(".delete()", function() {
       before(function(){
       
       });
       after(function(){
       
       });
      it("delete", function(){
      var File = new FileManager("/home/valentina/biolab.conf");
      var result = File.delete();
      assert.equal("not implemented yet",result);
      });
      });
});

