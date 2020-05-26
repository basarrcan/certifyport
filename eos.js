const { Api, JsonRpc, RpcError } = require('eosjs');
const ecc = require('eosjs-ecc')
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const { TextEncoder, TextDecoder } = require('util');
const dotenv = require('dotenv');

dotenv.config()

const defaultPrivateKey = process.env.EOS_PRIVATE_KEY; 
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const rpc = new JsonRpc(process.env.EOS_URL, { fetch });
const eos = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

(async () => {
    const privateKey = await ecc.randomKey();
    console.log(privateKey);
    const publicKey = await ecc.privateToPublic(privateKey);
    console.log(publicKey);
    console.log(process.env.EOS_URL)

    const newAccName = 'ozerikoaslan'
    
    try {
        const result = await eos.transact({
            actions: [{
              account: 'eosio',
              name: 'newaccount',
              authorization: [{
                actor: process.env.EOS_CONTRACT,
                permission: 'active',
              }],
              data: {
                creator: process.env.EOS_CONTRACT,
                name: newAccName,
                owner: {
                  threshold: 1,
                  keys: [{
                    key: publicKey,
                    weight: 1
                  }],
                  accounts: [],
                  waits: []
                },
                active: {
                  threshold: 1,
                  keys: [{
                    key: publicKey,
                    weight: 1
                  }],
                  accounts: [],
                  waits: []
                },
              },
            },
            {
              account: 'eosio',
              name: 'buyrambytes',
              authorization: [{
                actor: process.env.EOS_CONTRACT,
                permission: 'active',
              }],
              data: {
                payer: process.env.EOS_CONTRACT,
                receiver: newAccName,
                bytes: 3048,
              },
            },
            {
              account: 'eosio',
              name: 'delegatebw',
              authorization: [{
                actor: process.env.EOS_CONTRACT,
                permission: 'active',
              }],
              data: {
                from: process.env.EOS_CONTRACT,
                receiver: newAccName,
                stake_net_quantity: '0.1000 EOS',
                stake_cpu_quantity: '0.1000 EOS',
                transfer: false,
              }
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 30,
      });
      console.log(result)
    } catch(err) {
        console.log(err)
    }
})()

