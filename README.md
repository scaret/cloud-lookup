# cloud-lookup

Looks for DNS Settings from multiple AWS Route53 or Aliyun DNS service.

### Usage

```
const client = require('cloud-lookup').createClient({
    accounts: [{
        vendor: 'aws',
        config: {
            accessKeyId: '<accessKeyId>',
            secretAccessKey: '<secretAccessKey>'        
        }
    }]
});

const result = await client.query(<domainName>)
result.dump('./dns.csv');
```