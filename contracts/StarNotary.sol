// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {
    // Star data
    struct Star {
        string name;
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    // Initializes the contract by setting a `name` and a `symbol` to the star collection.
    constructor (string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't owned"
        );

        starsForSale[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(x);
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);

        require(msg.value > starCost, "You need to have enough Ether");
        
        _transfer(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        
        delete starsForSale[_tokenId]; // Reset the tokenId listed for sales

        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        
        ownerAddressPayable.transfer(starCost);
        
        if (msg.value > starCost) {
            address payable sender = _make_payable(msg.sender); // We need to make this conversion to be able to use transfer() function to transfer ethers
            sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        // owner of token 2
        address ownerOftoken1 = ownerOf(_tokenId1);

        // owner of token 2
        address ownerOftoken2 = ownerOf(_tokenId2);

        //2. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        require(
            ownerOftoken1 == msg.sender || ownerOftoken2 == msg.sender, 
            "Unauthorized: You can't exchange the Star you don't owned"
        );

        //4. Use transferFrom function to exchange the tokens.
        // transfer token 1
        _transfer(ownerOftoken1, ownerOftoken2, _tokenId1);

        // transfer token 1
        _transfer(ownerOftoken2, ownerOftoken1, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(
            ownerOf(_tokenId) == _msgSender(), 
            "Unauthorized: You can't transfer the Star you don't owned"
        );

        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId);
    }
}
