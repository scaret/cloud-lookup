const AWS = require('aws-sdk');
const LookupResult = require('./LookupResult');

const LookupClient = function(options){
    const that = this;
    that.awsAccounts = [];
    that.aliyunAccounts = [];

    options.accounts.forEach((account)=>{
        if (account.vendor === "aws"){
            account.client = new AWS.Route53(account.config);
            that.awsAccounts.push(account);
        }
    });

};

LookupClient.prototype.query = async function(domain) {
    const that = this;
    const result = new LookupResult();
    for (let accountId = 0; accountId < that.awsAccounts.length; accountId++){
        const account = that.awsAccounts[accountId];
        const hostedZonesResp = await account.client.listHostedZones().promise();
        for (let zoneId =0; zoneId < hostedZonesResp.HostedZones.length; zoneId++){
            const zone = hostedZonesResp.HostedZones[zoneId];
            if (domain && zone.Name.indexOf(domain) === -1){
                console.log(`Ignore ${zone.Name}`);
                continue;
            }else{
                console.log(`Processing ${zone.Name}`);
            }
            let NextRecordName = null;
            let NextRecordType = null;
            let IsTruncated = null;
            let MaxItems = 1000;
            for (var i = 0; i < 100; i++){
                console.log(`listResourceRecordSets ${zone.Name} ${i} ${i * MaxItems}~${(i + 1) * MaxItems}`);
                const param = {
                    HostedZoneId: zone.Id,
                    StartRecordName: NextRecordName,
                    StartRecordType: NextRecordType,
                };
                const recordSetsResp = await account.client.listResourceRecordSets(param).promise();
                IsTruncated = recordSetsResp.IsTruncated;
                NextRecordName = recordSetsResp.NextRecordName;
                NextRecordType = recordSetsResp.NextRecordType;

                for (var resourceRecordSetId = 0; resourceRecordSetId < recordSetsResp.ResourceRecordSets.length; resourceRecordSetId++){
                    const resourceRecordSet = recordSetsResp.ResourceRecordSets[resourceRecordSetId];
                    console.log(`#$${i * MaxItems + resourceRecordSetId} ${resourceRecordSet.Name} ${resourceRecordSet.Type}`);
                    resourceRecordSet.zone = zone;
                    resourceRecordSet.account = account;
                    result.push(resourceRecordSet);
                }
                if (!IsTruncated){
                    console.log(`Finished listResourceRecordSets ${zone.Name}. Total Record Count: ${i * MaxItems + recordSetsResp.ResourceRecordSets.length}.`);
                    break;
                }
            }
        }
    }
    return result;
};

module.exports = LookupClient;