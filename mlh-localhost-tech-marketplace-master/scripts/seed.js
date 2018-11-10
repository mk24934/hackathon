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

const createItems = async function() {
  return Promise.all(
    data.map(async item => {
      return await this.createItem(item.name, item.image, item.strike, item.callprice, {
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
