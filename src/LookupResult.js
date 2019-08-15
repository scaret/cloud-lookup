const csv = require('csv');
const fs = require('fs');

const LookupResult = function(records = []){
    this.records = records;
};

const LookupResultRecord = function(Name, TTL, Identifier, Weight, ContinentCode, CountryCode, SubdivisionCode, Zone, Vendor, Account, Type, Values = []){
    this.Name = Name;
    this.TTL = TTL;
    this.Identifier = Identifier;
    this.Weight = Weight;
    this.ContinentCode = ContinentCode;
    this.CountryCode = CountryCode;
    this.SubdivisionCode = SubdivisionCode;
    this.Zone = Zone;
    this.Vendor = Vendor;
    this.Account = Account;
    this.Type = Type;
    this.Values = Values;
};

LookupResult.prototype.dump = function(filePath){
    const that = this;
    const rows = [[
        "Name",
        "TTL",
        "Identifier",
        "Weight",
        "ContinentCode",
        "CountryCode",
        "SubdivisionCode",
        "Zone",
        "Vendor",
        "Account",
        "Type",
        "Value"
    ]];
    for (var recordId = 0; recordId < that.records.length; recordId++){
        var record = that.records[recordId];
        const row = [
            record.Name,
            record.TTL,
            record.Identifier || "",
            record.Weight || "",
            record.ContinentCode || "",
            record.CountryCode || "",
            record.SubdivisionCode || "",
            record.Zone || "",
            record.Vendor || "",
            record.Account || "",
            record.Type,
        ];
        record.Values.forEach((resource)=>{
            row.push(resource);
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
module.exports.LookupResultRecord = LookupResultRecord;
