const Market = artifacts.require("Market");
const data = require("../src/json/items.json");

const getItems = async function() {
  const size = await this.getSize();
  if (size > 0) {
    return Promise.all(
      Array(size.toNumber())
        .fill(0)
        .map(async (key, index) => {
          return await this.getItem(index);
        }),
    );
  }
};

iconMap = new Map();
iconMap.set('GOOGL', 'images/items/google.png');
iconMap.set('AMZN', 'images/items/amazon.png');
iconMap.set('FB', 'images/items/facebook.png');
iconMap.set('MNST', 'images/items/monster.jpg');
iconMap.set('BIIB', 'images/items/biogen.jpg');
iconMap.set('^GSPC', 'images/items/sp500.jpg');

const createItems = async function() {
  return Promise.all(
    data.map(async item => {
      return await this.createItem(item.name, iconMap.get(item.name), item.strike, item.callprice, {
        privateFor: [
          "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
          "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg=",
        ],
      });
    }),
  );
};

module.exports = async function() {
  try {
    const contract = await Market.deployed();
    contract.getItems = getItems.bind(contract);
    contract.createItems = createItems.bind(contract);

    await contract.createItems();

    console.log(await contract.getItems());
  } catch (error) {
    console.log(error);
  }
};
