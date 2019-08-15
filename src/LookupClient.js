const MakeLookupAccountAWS = require('./LookupAccountAWS').MakeLookupAccountAWS;
const MakeLookupAccountAliyun = require('./LookupAccountAliyun').MakeLookupAccountAliyun;
const LookupResult = require('./LookupResult');

const LookupClient = function(options){
    const that = this;
    that.awsAccounts = [];
    that.aliyunAccounts = [];

    options.accounts.forEach((account)=>{
        if (account.vendor === "aws"){
            MakeLookupAccountAWS(account);
            that.awsAccounts.push(account);
        }
        if (account.vendor === "aliyun"){
            MakeLookupAccountAliyun(account);
            that.aliyunAccounts.push(account);
        }
    });

};

LookupClient.prototype.query = async function(domain) {
    const that = this;
    const result = new LookupResult();
    for (let accountId = 0; accountId < that.awsAccounts.length; accountId++){
        const account = that.awsAccounts[accountId];
        const accountResult = await account.query(domain);
        result.records = result.records.concat(accountResult);
    }
    for (let accountId = 0; accountId < that.aliyunAccounts.length; accountId++){
        const account = that.aliyunAccounts[accountId];
        const accountResult = await account.query(domain);
        result.records = result.records.concat(accountResult);
    }
    return result;
};

module.exports = LookupClient;