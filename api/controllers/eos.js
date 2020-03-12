const { Api, JsonRpc, RpcError } = require('eosjs');
const ecc = require('eosjs-ecc')
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const { TextEncoder, TextDecoder } = require('util');

const defaultPrivateKey = process.env.EOS_PRIVATE_KEY; 
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const rpc = new JsonRpc(process.env.EOS_URL, { fetch });
const eos = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
exports.tn_createCorporate = async (req, res, next) => {
  try {
    const { corporateId, corporateName, createAmount } = req.body;
    // kontratın addcustomer actionını çağırma
    const result = await eos.transact({
      actions: [{
        account: process.env.EOS_CONTRACT,
        name: 'createcorp',
        authorization: [{
          actor: process.env.EOS_CONTRACT,
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

    return res.status(201).json({
      success: true,
      errorCode: "",
      message: corporateName + " with " + corporateId + " id is added.",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}

exports.tn_addAmount = async (req, res, next) => {
  try {
    const { corporateId, amount } = req.body;
    // kontratın addcustomer actionını çağırma
    const result = await eos.transact({
      actions: [{
        account: process.env.EOS_CONTRACT,
        name: 'addamount',
        authorization: [{
          actor: process.env.EOS_CONTRACT,
          permission: 'active',
        }],
        data: {
          id: corporateId,
          amount
        },
      }]
      },
      {
          blocksBehind: 3,
          expireSeconds: 30,
      });

    return res.status(201).json({
      success: true,
      errorCode: "",
      message: amount + " added to " + corporateId + " .",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}

exports.tn_createCertificate = async (req, res, next) => {
  try {
    const { certificateId, corporateId, certificateTemplate, assignees } = req.body;
    // kontratın addcustomer actionını çağırma
    const result = await eos.transact({
      actions: [{
        account: process.env.EOS_CONTRACT,
        name: 'createcert',
        authorization: [{
          actor: process.env.EOS_CONTRACT,
          permission: 'active',
        }],
        data: {
          id: certificateId,
          corporateid: corporateId,
          certtemplate: certificateTemplate,
          assignees
        },
      }]
      },
      {
          blocksBehind: 3,
          expireSeconds: 30,
      });

    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Certificate with " + certificateId + " id is added for corporate id " + corporateId + ".",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}

exports.tn_deleteCertificate = async (req, res, next) => {
  try {
    const { certificateId, corporateId } = req.body;
    // kontratın addcustomer actionını çağırma
    const result = await eos.transact({
      actions: [{
        account: process.env.EOS_CONTRACT,
        name: 'deletecert',
        authorization: [{
          actor: process.env.EOS_CONTRACT,
          permission: 'active',
        }],
        data: {
          id: certificateId,
          corporateid: corporateId
        },
      }]
      },
      {
          blocksBehind: 3,
          expireSeconds: 30,
      });

    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Certificate with " + certificateId + " id is deleted from corporate id " + corporateId + ".",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}

exports.tn_addSigner = async (req, res, next) => {
  try {
    const { certificateId, corporateId, signers } = req.body;
    console.log(signers);
    // kontratın addcustomer actionını çağırma
    const result = await eos.transact({
      actions: [{
        account: process.env.EOS_CONTRACT,
        name: 'addsigner',
        authorization: [{
          actor: process.env.EOS_CONTRACT,
          permission: 'active',
        }],
        data: {
          id: certificateId,
          corporateid: corporateId,
          signers
        },
      }]
      },
      {
          blocksBehind: 3,
          expireSeconds: 30,
      });

    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Signer(s) with " + signers + " id is added",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error.message,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}


exports.tn_createSigner = async (req, res, next) => {
  try {
    const privateKey = await ecc.randomKey();
    const publicKey = await ecc.privateToPublic(privateKey);

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
          name: req.body.accountName,
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
          receiver: req.body.accountName,
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
          receiver: req.body.accountName,
          stake_net_quantity: '0.1000 EOS',
          stake_cpu_quantity: '0.1000 EOS',
          transfer: false,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Account " + req.body.accountName + " created ",
      keys: {privateKey: privateKey, publicKey: publicKey},
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}

exports.tn_signCertificate = async (req, res, next) => {
  try {
    const { signer, certificateId, corporateId, signerPrivate } = req.body;
    const signSignatureProvider = new JsSignatureProvider([signerPrivate, defaultPrivateKey]);
    const signEos = new Api({ rpc, signatureProvider: signSignatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    const result = await signEos.transact({
      actions: [{
        account: process.env.EOS_CONTRACT,
        name: 'signcert',
        authorization: [{
          actor: process.env.EOS_CONTRACT,
          permission: 'active',
        },{
          actor: signer,
          permission: 'active',
        }],
        data: {
          id: certificateId,
          corporateid: corporateId,
          signerr: signer
        },
      }]
      },
      {
          blocksBehind: 30,
          expireSeconds: 30,
      });

    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Certificate with " + certificateId + " is signed by " + signer + ".",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error.message,
      message: "Something went wrong, please check your inputs.",
      data: {}
    });
  }
}

exports.tn_getCertificate = async (req, res, next) => {
  try {
    const { certificateId, corporateId } = req.query;
    if(typeof corporateId === 'undefined') {
      throw new Error("Valid corporateId had not been provided.");
    }
    if(typeof certificateId === 'undefined') {
      throw new Error("Valid certificateId had not been provided.");
    }
    const result = await getTable("certificate", corporateId, certificateId);
    console.log(result);
    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Certificate with " + certificateId + " id returned",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: "",
      message: error.message || "Something went wrong.",
      data: {}
    });
  }
}

exports.tn_getCorporate = async (req, res, next) => {
  try {
    const { corporateId } = req.query;
    if(typeof corporateId === 'undefined') {
      throw new Error("Valid corporateId had not been provided.");
    }
    const result = await getTable("corporate", process.env.EOS_CONTRACT, corporateId);
    return res.status(201).json({
      success: true,
      errorCode: "",
      message: "Corporate with " + corporateId + " id returned",
      data: result
    });
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      errorCode: error,
      message: error.message || "Something went wrong.",
      data: {}
    });
  }
}

async function getTable(tableName, scope, key) {
  const results = await rpc.get_table_rows({
    json: true,                 // Get the response as json
    code: process.env.EOS_CONTRACT,           // Contract that we target
    scope: scope,           // Account that owns the data
    table: tableName,
    lower_bound: key,
    upper_bound: key,
    reverse: false,            // Optional: Get reversed data
    show_payer: false,         // Optional: Show ram payer
    limit: 1,
  });
  if(results.rows.length == 0) {
    throw new Error("No index found in " + tableName + " table with the key value: " + key);
  }
    return results.rows[0];
};