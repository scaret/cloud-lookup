const csv = require('csv');
const fs = require('fs');

const LookupResult = function(records = []){
    this.records = records;
};

LookupResult.prototype.push = function(elem){
    return this.records.push(elem);
}

LookupResult.prototype.dump = function(filePath){
    const that = this;
    const rows = [];
    for (var recordId = 0; recordId < that.records.length; recordId++){
        var record = that.records[recordId];
        const row = [
            record.Name,
            record.TTL,
            record.SetIdentifier || "",
            record.GeoLocation && record.GeoLocation.ContinentCode || "",
            record.GeoLocation && record.GeoLocation.CountryCode || "",
            record.GeoLocation && record.GeoLocation.SubdivisionCode || "",
            record.zone && record.zone.Id || "",
            record.account && record.account.vendor || "",
            record.account && record.account.config && record.account.config.accessKeyId || "",
            record.Type,
        ];
        record.ResourceRecords.forEach((resource)=>{
            row.push(resource.Value);
        });
        rows.push(row);
    }
    return new Promise((resolve, reject)=>{
        console.log(`Start Dump ${filePath}`);
        csv.stringify(rows, function(err, output){
            if (err){
                reject(err);
            }else{
                fs.writeFile(filePath, output ,function(err){
                   if (err){
                       reject(err);
                   }else{
                       console.log(`Dumped to ${filePath}`);
                   }
                });
            }
        });
    })
};

module.exports = LookupResult;