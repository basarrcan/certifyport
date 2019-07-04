const { Api, JsonRpc, RpcError } = require('eosjs');
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const { TextEncoder, TextDecoder } = require('util');

const defaultPrivateKey = "*****"; 
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const rpc = new JsonRpc("https://jungle2.cryptolions.io:443", { fetch });
const eos = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const contractAccount = "cerifyeos111"

//--- Examples

//createCorporate(4, "testCorp4", 10);
//createCertificate(1, 4, "template", [1,2,3], ["cerifyeos111", "test"]);
//signCertificate("cerifyeos111", 1, 4);
getCertificate(1,4);
// getCorporate(4);

//---

async function createCorporate(corporateId, corporateName, createAmount) {
    const result = await eos.transact({
        actions: [{
          account: contractAccount,
          name: 'createcorp',
          authorization: [{
            actor: contractAccount,
            permission: 'active',
          }],
          data: {
            id: corporateId,
            name: corporateName,
            create_amount: createAmount,
          },
        }]
        },
        {
            blocksBehind: 3,
            expireSeconds: 30,
        });

        console.log(result);

    return {
        success: true,
        errorCode: "",
        message: corporateName + " with " + corporateId + " id is added.",
        chainResult: result
        };
}

async function createCertificate(certificateId, corporateId, certificateTemplate, assignees, signers) {
    let signersToSend = [];
    await signers.forEach(signer => {
        signersToSend.push(
            {
                name: signer,
                issigned: false
            }
        );
    });
    const result = await eos.transact({
        actions: [{
          account: contractAccount,
          name: 'createcert',
          authorization: [{
            actor: contractAccount,
            permission: 'active',
          }],
          data: {
            id: certificateId,
            corporateid: corporateId,
            certtemplate: certificateTemplate,
            assingnees: assignees,
            signers: signersToSend
          },
        }]
        },
        {
            blocksBehind: 3,
            expireSeconds: 30,
        });

    console.log(result);

    return {
        success: true,
        errorCode: "",
        message: "Certificate with " + corporateId + " id is added for corporate id " + corporateId + ".",
        chainResult: result
        };
}

async function signCertificate(signer, certificateId, corporateId) {

    const result = await eos.transact({
        actions: [{
          account: contractAccount,
          name: 'signcert',
          authorization: [{
            actor: contractAccount,
            permission: 'active',
          }],
          data: {
            signer: signer,
            certificateid: certificateId,
            corporateid: corporateId
          },
        }]
        },
        {
            blocksBehind: 3,
            expireSeconds: 30,
        });

    console.log(result);

    return {
        success: true,
        errorCode: "",
        message: "Certificate with " + corporateId + " id is added for corporate id " + corporateId + ".",
        chainResult: result
    };
}

async function getCertificate(certificateId, corporateId){
    const result = await getTable("certificate", corporateId, certificateId);
    console.log(result);
    return result;
}

async function getCorporate(corporateId){
    const result = await getTable("corporate", contractAccount, corporateId);
    console.log(result);
    return result;
}

async function getTable(tableName, scope, key) {
    const results = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: contractAccount,           // Contract that we target
      scope: scope,           // Account that owns the data
      table: tableName,
      lower_bound: key,
      upper_bound: key,
      reverse: false,            // Optional: Get reversed data
      show_payer: false,         // Optional: Show ram payer
      limit: 1,
    });
      return results.rows[0];
  };