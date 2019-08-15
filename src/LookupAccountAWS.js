const AWS = require('aws-sdk');
const LookupResultRecord = require('./LookupResult').LookupResultRecord;

const MakeLookupAccountAWS = function(account){
    account.client = new AWS.Route53(account.config);

    account.query = async (domain)=>{
        const result = [];
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
                    const lookupResultRecord = new LookupResultRecord(
                        resourceRecordSet.Name,
                        resourceRecordSet.TTL,
                        resourceRecordSet.SetIdentifier,
                        resourceRecordSet.Weight,
                        resourceRecordSet.GeoLocation && resourceRecordSet.GeoLocation.ContinentCode,
                        resourceRecordSet.GeoLocation && resourceRecordSet.GeoLocation.CountryCode,
                        resourceRecordSet.GeoLocation && resourceRecordSet.GeoLocation.SubdivisionCode,
                        zone.Id,
                        account.vendor,
                        account.config.accesskeyId,
                        resourceRecordSet.Type,
                        resourceRecordSet.ResourceRecords.map((record)=>record.Value),
                    );
                    result.push(lookupResultRecord);
                }
                if (!IsTruncated){
                    console.log(`Finished listResourceRecordSets ${zone.Name}. Total Record Count: ${i * MaxItems + recordSetsResp.ResourceRecordSets.length}.`);
                    break;
                }
            }
        }
        return result;
    }
};

module.exports.MakeLookupAccountAWS = MakeLookupAccountAWS;