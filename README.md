# Event Observer

## Before start up
The server depends on data storage and well configured `config.json` file setting actual factory address and RPC url:
```bash
docker run -d -p 0.0.0.0:27017:27017 mongo
```
config.json:
```json
{
  "factoryAddress": "<put-correct-address-here>",
  "RPCUrl": "http://127.0.0.1:8545"
}
```

## Run the server
Since the storage service and RPC-node are started, `config.json` is configured, the observer is ready to be run:
```bash
npm install
node ./app.js
```

The command above also starts HTTP-server which allows to obtain received events by calling end-points:
```
/last_events/<event_name>/<amount>
```
It returns the last `amount` of events specified in `event_name`.  
Allowed `event_name` values:  
`collection_created`: returns the last `CollectionCreated` events;
`token_minted`: `TokenMinted`; 
