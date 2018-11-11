pragma solidity ^0.4.17;

contract Market {
  Item[] public items;
  mapping(address => uint256) public balances;

  struct Item {
    address owner;
    string name;
    string image;
    uint256 strike;
    uint256 callprice;
    string nickname;

  }

  function Market(address nodeA, address nodeB, address nodeC) public {
    balances[nodeA] = 10 ether;
    balances[nodeB] = 10 ether;
    balances[nodeC] = 10 ether;
  }

  function getBalance(address node) public view returns (uint256){
    return balances[node];
  }

  function createItem(string _name, string _image, uint256 _strike, uint256 _callprice) public {
    address _owner;
    Item memory _item = Item(_owner, _name, _image, _strike, _callprice, "" );
    items.push(_item);
  }

  function buyItem(uint id) public returns (uint) {
    require(id >= 0 && id <= items.length);
    require(msg.sender != items[id].owner);
    require(balances[msg.sender] >= items[id].callprice);

    balances[msg.sender] -= items[id].callprice;
    items[id].owner = msg.sender;

    return id;
  }

  function sellItem(uint id) public returns (uint) {
    require(id >= 0 && id <= items.length);
    require(msg.sender == items[id].owner);

    balances[msg.sender] += items[id].price;
    delete items[id].owner;

    return id;
  }

  function setNickname(uint id, string newNickname) public returns (uint) {
    require(id >= 0 && id <= items.length);

    items[id].nickname = newNickname;

    return id;
  }

  function getSize() public view returns (uint) {
    return items.length;
  }

  function getItem(uint id) public view returns (uint, address, string, string, uint256, uint256, string) {
    return (id, items[id].owner, items[id].name, items[id].image, items[id].strike, items[id].callprice, items[id].nickname);
  }
}
