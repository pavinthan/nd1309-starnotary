const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    const tokenId = 1;
    const instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 2;
    const starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);

    await instance.buyStar(starId, { from: user2, value: balance });
    
    const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1)

    const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    const value2 = Number(balanceOfUser1AfterTransaction);

    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

// https://github.com/udacity/nd1309-p2-Decentralized-Star-Notary-Service-Starter-Code/pull/16
it('lets user2 buy a star and decreases its balance in ether', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser2BeforeTransaction = web3.utils.toBN(await web3.eth.getBalance(user2));
    const txInfo = await instance.buyStar(starId, {from: user2, value: balance});
    const balanceAfterUser2BuysStar = web3.utils.toBN(await web3.eth.getBalance(user2));    
    
    // Important! Note that because these are big numbers (more than Number.MAX_SAFE_INTEGER), we
    // need to use the BN operations, instead of regular operations, which cause mathematical errors.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER

    // calculate the gas fee
    const tx = await web3.eth.getTransaction(txInfo.tx);
    const gasPrice = web3.utils.toBN(tx.gasPrice);
    const gasUsed = web3.utils.toBN(txInfo.receipt.gasUsed);
    const txGasCost = gasPrice.mul(gasUsed);    

    // final balance == initial balance - star price - gas fee
    const starPriceBN = web3.utils.toBN(starPrice); // from string
    const expectedFinalBalance = balanceOfUser2BeforeTransaction.sub(starPriceBN).sub(txGasCost);
    assert.equal(expectedFinalBalance.toString(), balanceAfterUser2BuysStar.toString());
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
    const name = "Test Udacity Star Notary"
    const symbol = "TUSN"

    // 1. create a Star with different tokenId
    const instance = await StarNotary.new(name, symbol);

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), name);

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.symbol.call(), symbol);
});

it('lets 2 users exchange stars', async () => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();

    const user1 = accounts[1];
    const user2 = accounts[2];

    const starId1 = 600;
    const starId2 = 601;
    
    await instance.createStar('awesome star #1', starId1, { from: user1 });
    await instance.createStar('awesome star #2', starId2, { from: user2 });
    
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2, {from: user1});

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(starId1), user2);

    assert.equal(await instance.ownerOf.call(starId2), user1);
});

it('lets a user transfer a star', async () => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();

    const user1 = accounts[1];
    const user2 = accounts[2];
    
    const starId1 = 700;

    await instance.createStar('awesome star #1', starId1, { from: user1 });

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId1, {from: user1});

    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId1), user2);
});

it('lookUptokenIdToStarInfo test', async () => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();

    const user1 = accounts[1];
    const starId1 = 800;
    const starIdName = "awesome star #1";

    await instance.createStar(starIdName, starId1, { from: user1 });

    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    assert.equal(await instance.lookUptokenIdToStarInfo.call(starId1), starIdName);
});
