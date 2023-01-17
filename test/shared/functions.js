const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { expect } = require('chai');

const constants = require('../../constants');
const methods = require('./methods');

const buildRoot = async (addresses = constants.ADDRESSES) => {
    const leaves = addresses.map((x) => keccak256(x));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    const buf2hex = (x) => '0x' + x.toString('hex');

    const root = buf2hex(tree.getRoot());

    return { tree, root };
};

const returnBuildRoot = async (addresses = constants.ADDRESSES) => {
    const { root } = await buildRoot(addresses);
    return root;
};

const buildProof = async (address, addresses = constants.ADDRESSES) => {
    const leaves = addresses.map((x) => keccak256(x));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    const buf2hex = (x) => '0x' + x.toString('hex');

    const leaf = keccak256(address);
    const proof = tree.getProof(leaf).map((data) => buf2hex(data.data));

    return { tree, proof };
};

const returnBuildProof = async (address, addresses = constants.ADDRESSES) => {
    const { proof } = await buildProof(address, addresses);
    return proof;
};

const sendRawTxn = async (input, sender, ethers, provider) => {
    const txCount = await provider.getTransactionCount(sender.address);
    const rawTx = {
        chainId: network.config.chainId,
        nonce: ethers.utils.hexlify(txCount),
        to: input.to,
        value: input.value || 0x00,
        gasLimit: ethers.utils.hexlify(3000000),
        gasPrice: ethers.utils.hexlify(25000000000),
        data: input.data
    };
    const rawTransactionHex = await sender.signTransaction(rawTx);
    const { hash } = await provider.sendTransaction(rawTransactionHex);
    return await provider.waitForTransaction(hash);
};

const checkRawTxnResult = async (input, sender, error) => {
    let result;
    if (error)
        if (network.name === 'hardhat') await expect(sendRawTxn(input, sender, ethers, ethers.provider)).to.be.revertedWith(error);
        else expect.fail('AssertionError: ' + error);
    else {
        result = await sendRawTxn(input, sender, ethers, ethers.provider);
        expect(result.status).to.equal(1);
    }
    return result;
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
};

module.exports = {
    buildRoot,
    returnBuildRoot,
    buildProof,
    returnBuildProof,
    sendRawTxn,
    checkRawTxnResult,
    getRandomInt
};