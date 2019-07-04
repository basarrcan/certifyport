const Web3 = require('web3');
const fs = require('fs');

//const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/c9db9a7072c74d1b9b036b8d404f2b7f"));

const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/48b2aec0d2ae4aa2af2dfe918f174bf7"));

web3.eth.confirmationNumber = 2;

const abistr = fs.readFileSync('cerify.abi', 'utf8');
const abi = JSON.parse(abistr);

const gasPrice = '17000000000';
// const contractAddress = '0x8c7c116175a67cc18a3c33c8f482b9cbf77dae87';
const contractAddress = '0x725e4a8c73e1609251bcbe043018189a0e15350c';

const myContract = web3.eth.Contract(abi, contractAddress);

// const ownerPub = '0x27105356F6C1ede0e92020e6225E46DC1F496b81';
// const ownerPriv = '0x12a1a5e255f23853aeac0581e7e5615433de9817cc5a455c8230bd4f91a03bbb';

const ownerPub = '0x22Ecd579337Cde2CFCaDA7d2890A5CC542A708d3'
const ownerPriv = '0x6bb824befc5306d16250b065ec3d66a22e139e5a59d8dcebbd882256af1ffee2'

const corporatePub = '0x22Ecd579337Cde2CFCaDA7d2890A5CC542A708d3';
const corporatePriv = '0x6bb824befc5306d16250b065ec3d66a22e139e5a59d8dcebbd882256af1ffee2';

const signerPub = '0x22Ecd579337Cde2CFCaDA7d2890A5CC542A708d3';
const signerPriv = '0x6bb824befc5306d16250b065ec3d66a22e139e5a59d8dcebbd882256af1ffee2';

//getCorporate(corporatePub);

//createCorporate(ownerPub, ownerPriv, '0x27105356F6C1ede0e92020e6225E46DC1F496b81', 'oldCorporate', 10);
//createCertificate(corporatePub, corporatePriv, 20, 1, signerPub, [1,2,3,4]);
getCertificate(20);

// // addCreateAmount(ownerPub, ownerPriv, corporatePub, 5);
//signCertificate(signerPub, signerPriv, 20);

//---------------------- create corporate örneği ------------------------

function createCorporate(ownerPub, ownerPriv, corporateAddress, corporateName, addAmount) {
    const corporateEncodedABI = myContract.methods.createCorporate(corporateAddress, corporateName, addAmount).encodeABI();
    const corporateTx = {
        from: ownerPub,
        to: contractAddress,
        gas: 8000000,
        gasPrice: gasPrice,
        data: corporateEncodedABI
    };

    web3.eth.accounts.signTransaction(corporateTx, ownerPriv).then(async signed => {
        const tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

        tran.on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation: ' + confirmationNumber);
        });

        tran.on('transactionHash', hash => {
            console.log('hash');
            console.log(hash);
        });

        tran.on('receipt', receipt => {
            console.log('reciept');
            console.log(receipt);
        });
        tran.on('error', console.error);
    });

}

// ----------------- corporate get ---------------------

function getCorporate(address) {
    myContract.methods.corporates(address).call().then(result => {
        console.log(result);
        console.log("-> get")
    }
    ).catch(err => {
        console.log(err);
    });
}

//----------------- create certificate örneği ------------------

function createCertificate(corporatePub, corporatePriv, certificateId, template, signerAddress, assigneeIds = []) {
    const certificateEncodedABI = myContract.methods.createCertificate(certificateId, template, signerAddress, assigneeIds).encodeABI();
    const certificateTx = {
        from: corporatePub,
        to: contractAddress,
        gas: 8000000,
        gasPrice: gasPrice,
        data: certificateEncodedABI
    };

    web3.eth.accounts.signTransaction(certificateTx, corporatePriv).then( async signed => {
        const tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

        tran.on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation: ' + confirmationNumber);
        });

        tran.on('transactionHash', hash => {
            console.log('hash');
            console.log(hash);
        });

        tran.on('receipt', receipt => {
            console.log('reciept');
            console.log(receipt);
        });
        tran.on('error', console.error);
    });
}

// ----------------- certificate get ----------------------

function getCertificate(certificateId) {
    myContract.methods.certificate(certificateId).call().then(result => {
        console.log(result);
        console.log("-> get")
    }
    ).catch(err => {
        console.log(err);
    });
}


//RANDOM ACCOUNT
// const entrophyLength = 32; // randomlığı artırmak için kullanılacak entrophy değeri uzunluğu (minimum 32)
// const randHex = web3.utils.randomHex(entrophyLength);
// const acct = web3.eth.accounts.create(randHex);
// console.log(acct);


//---------------------- add create amount örneği ------------------------

function addCreateAmount(ownerPub, ownerPriv, corporateAddress, amount) {
    const addCorEncodedABI = myContract.methods.addCreateAmount(corporateAddress, amount).encodeABI();
    const addCorTx = {
        from: ownerPub,
        to: contractAddress,
        gas: 8000000,
        gasPrice: gasPrice,
        data: addCorEncodedABI
    };

    web3.eth.accounts.signTransaction(addCorTx, ownerPriv).then(async signed => {
        const tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

        tran.on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation: ' + confirmationNumber);
        });

        tran.on('transactionHash', hash => {
            console.log('hash');
            console.log(hash);
        });

        tran.on('receipt', receipt => {
            console.log('reciept');
            console.log(receipt);
        });
        tran.on('error', console.error);
    });
}

const addAmount = 5;




//---------------------- sign certificate örneği ------------------------

function signCertificate(signerPub, signerPriv, certificateId) {
    const signEncodedABI = myContract.methods.signCertificate(certificateId).encodeABI();
    const signTx = {
        from: signerPub,
        to: contractAddress,
        gas: 8000000,
        gasPrice: gasPrice,
        data: signEncodedABI
    };

    web3.eth.accounts.signTransaction(signTx, signerPriv).then( async signed => {
        const tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

        tran.on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation: ' + confirmationNumber);
        });

        tran.on('transactionHash', hash => {
            console.log('hash');
            console.log(hash);
        });

        tran.on('receipt', receipt => {
            console.log('reciept');
            console.log(receipt);
        });
        tran.on('error', console.error);
    });
}