const Alidns = require('alidns-nodejs');
const LookupResultRecord = require('./LookupResult').LookupResultRecord;

const MakeLookupAccountAliyun = function(account){
    account.client = new Alidns(account.config);

    account.client.queryDataPromise = async (params)=>{
        return new Promise((resolve, reject)=>{
            account.client.queryData(params, (err, data)=>{
                if (err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    };

    account.query = async (domain)=>{
        const result = [];
        const domainDataRes = await account.client.queryDataPromise({
            Action: 'DescribeDomains',
            PageSize: 100,
        });
        // console.log("domainDataRes", JSON.stringify(domainDataRes, null, 2));
        for (let domainDataId = 0; domainDataId < domainDataRes.Domains.Domain.length; domainDataId++){
            const domainData = domainDataRes.Domains.Domain[domainDataId];
            if (domain && domainData.DomainName.indexOf(domain) === -1){
                console.log(`Ignoring ${domainData.DomainName} ${domainData.VersionName} ${domainData.VersionCode}`);
                continue;
            }else{
                console.log(`Processing ${domainData.DomainName} ${domainData.VersionName} ${domainData.VersionCode}`);
            }
            const RecordCount = domainData.RecordCount;
            const PageSize = 500;
            for (let PageNumber = 1; PageNumber <= Math.ceil(RecordCount / PageSize); PageNumber++){
                const domainRecordsRes = await account.client.queryDataPromise({
                    Action: 'DescribeDomainRecords',
                    DomainName: domainData.DomainName,
                    PageSize: 100,
                });
                for (let recordId = 0; recordId < domainRecordsRes.DomainRecords.Record.length; recordId++){
                    const record = domainRecordsRes.DomainRecords.Record[recordId];
                    const lookupResultRecord = new LookupResultRecord(
                        record.RR + "." + record.DomainName,
                        record.TTL,
                        record.RecordId,
                        record.Weight,
                        record.Line,
                        "",
                        "",
                        domainData.DomainName,
                        account.vendor,
                        account.config.accesskeyId,
                        record.Type,
                        [record.Value]
                    );
                    result.push(lookupResultRecord);
                }
            }
        }
        return result;
    }
};

module.exports.MakeLookupAccountAliyun = MakeLookupAccountAliyun;