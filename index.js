const LookupClient = require("./src/LookupClient");

module.exports = {
    createClient: function(options){
        var client = new LookupClient(options);
    }
};
