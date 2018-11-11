App = {
  web3Provider: null,
  contracts: {},
  account: null,

  /**
   * Initializes web application using current account and provider
   */
  init: function(accounts) {
    App.accounts = accounts;
    App.account = App.getAccount(window.location.pathname);

    /* Initialize web3 */
    App.web3Provider = new Web3.providers.HttpProvider(App.account.provider);

    web3 = new Web3(App.web3Provider);

    App.account.hash = web3.eth.accounts[0];

    return App.initContract();
  },

  /**
   * Initializes smart contract on web application
   */
  initContract: function() {
    $.getJSON("Market.json", function(data) {
      App.contracts.Market = TruffleContract(data);

      App.contracts.Market.setProvider(App.web3Provider);

      return App.fetchItems();
    });

    return App.setupPage();
  },

  /**
   * Retrieves items from Market.sol smart contract
   */
  fetchItems: function() {
    var instance;
    var itemRow = $("#itemRow");
    var itemTemplate = $("#itemTemplate");

    App.contracts.Market.deployed()
      .then(function(result) {
        instance = result;
        return instance.getSize();
      })
      .then(function(size) {
        for (id = 0; id < size; id++) {
          instance.getItem(id).then(function(marketplaceItem) {
            var itemEl = App.fillElement(marketplaceItem, itemTemplate);
            itemEl.find(".marketplace-item").attr("data-id", marketplaceItem[0]);

            itemRow.append(itemEl.html());
          });
        }
      });

    return App.fetchBalance();
  },

  /**
   * Retrieves balance for current account from smart contract
   */
  fetchBalance: function() {
    App.contracts.Market.deployed()
      .then(function(instance) {
        return instance.getBalance(App.account.hash);
      })
      .then(function(balance) {
        $(".account-balance").text(Number(web3.fromWei(balance)).toFixed(2));
      })
      .catch(function(error) {
        console.log(error);
      });
  },

  /**
   * Sets up HTML elements based on available contract data
   */
  setupPage: function() {
    var template = $("#account-item");
    $("#account-name").text(App.account.name);
    $("#account-image").text(App.account.image);

    Object.keys(App.accounts).forEach(function(key, index) {
      var account = App.accounts[key];
      template.find(".dropdown-item").attr("href", "/" + (index + 1));
      template.find(".dropdown-item").text(account.name);
      template.find(".dropdown-item").toggleClass("active", App.account === account);
      $(".dropdown-menu").append(template.html());
    });

    return App.bindEvents();
  },

  /**
   * Updates HTML card element with data for marketplace item
   */
  fillElement: function(data, element) {
    var strike = Number(web3.fromWei(data[4] * 10000000000000000)).toFixed(2);
    var ether = Number(web3.fromWei(data[5] * 10000000000000000)).toFixed(2);
    var isOwned = data[1] !== "0x0000000000000000000000000000000000000000";
    var nickname = data[6].length > 0 ? `"${data[6]}"` : "";

    element.find(".btn-buy").toggle(data[1] !== App.account.hash);
    element.find(".btn-buy").toggleClass("disabled", isOwned);
    element.find(".btn-sell").toggle(data[1] === App.account.hash);
    element.find(".card-item-name").text(data[2]);
    element.find(".card-img-top").attr("src", data[3]);
    element.find(".card-strike-amount").text(strike);
    element.find(".card-price-amount").text(ether);
    element.find(".card-item-nickname").text(nickname);

    return element;
  },

  /**
   * Bind actions with HTML elements
   */
  bindEvents: function() {
    $(document).on("click", ".btn-buy", App.handleBuying);
    $(document).on("click", ".btn-sell", App.handleSelling);
    $(document).on("keypress", ".card-input-name", App.handleNickname);
    $(document).on("click", ".btn-edit", App.toggleEdit);
  },

  /**
   * Shows/hides nickname input element for market item
   */
  toggleEdit: function(event) {
    var parent = $(event.target).closest(".card-info-wrapper");

    parent.find(".btn-edit").toggle(false);
    parent.find(".card-info").toggle(false);
    parent.find(".card-input-name").toggle(true);
  },

  /**
   * Handles action when user clicks 'Buy'. Calls
   * the buying action on the smart contract.
   */
  handleBuying: function(event) {
    event.preventDefault();
    var instance;
    var button = $(event.target);
    var card = button.closest(".marketplace-item");
    var itemId = card.data("id");

    button.toggleClass("disabled");
    button.prop("disabled", true);

    App.contracts.Market.deployed()
      .then(function(contract) {
        instance = contract;

        // Creates array of keys from other accounts
        var privateFor = $(App.accounts)
          .not([App.account])
          .get()
          .map(function(acc) {
            return acc.key;
          });

        return instance.buyItem(itemId, {
          from: App.account.hash,
          privateFor: privateFor,
        });
      })
      .then(function() {
        return instance.getItem(itemId);
      })
      .then(function(data) {
        button.toggleClass("disabled");
        button.prop("disabled", false);

        App.fetchBalance();
        return App.fillElement(data, card);
      })
      .catch(function(error) {
        button.toggleClass("disabled");
        button.prop("disabled", false);

        console.log(error);
      });
  },

  /**
   * Handles action when user clicks 'Sell'. Calls
   * the selling action on the smart contract.
   */
  handleSelling: function(event) {
    event.preventDefault();
    var instance;
    var button = $(event.target);
    var card = button.closest(".marketplace-item");
    var itemId = card.data("id");

    button.toggleClass("disabled");
    button.prop("disabled", true);

    App.contracts.Market.deployed()
      .then(function(contract) {
        instance = contract;

        // Creates array of keys of accounts excluding the current account
        var privateFor = $(App.accounts)
          .not([App.account])
          .get()
          .map(function(acc) {
            return acc.key;
          });

        return instance.sellItem(itemId, {
          from: App.account.hash,
          privateFor: privateFor,
        });
      })
      .then(function() {
        return instance.getItem(itemId);
      })
      .then(function(data) {
        button.toggleClass("disabled");
        button.prop("disabled", false);

        App.fetchBalance();
        return App.fillElement(data, card);
      })
      .catch(function(error) {
        button.toggleClass("disabled");
        button.prop("disabled", false);

        console.log(error);
      });
  },

  /**
   * Handles action when user nicknames item. Creates
   * private transaction to update nickname on the contract.
   */
  handleNickname: function(event) {
    if (event.which == 13) {
      // 'Enter' keypress
      var instance;
      var name = event.target.value;
      var card = $(event.target).closest(".marketplace-item");
      var itemId = card.data("id");

      App.contracts.Market.deployed()
        .then(function(contract) {
          instance = contract;
          return instance.setNickname(itemId, name, {
            from: App.account.hash,
            privateFor: [],
          });
        })
        .then(function() {
          return instance.getItem(itemId);
        })
        .then(function(data) {
          card.find(".btn-edit").toggle(true);
          card.find(".card-info").toggle(true);
          card.find(".card-input-name").toggle(false);

          return App.fillElement(data, card);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  },

  /**
   * Switches accounts based on browser routes
   */
  getAccount: function(pathname) {
    switch (window.location.pathname) {
      case "/1":
        return App.accounts[0];
      case "/2":
        return App.accounts[1];
      case "/3":
        return App.accounts[2];
      default:
        return App.accounts[0];
    }
  },
};

$(function() {
  $(window).load(function() {
    $.getJSON("json/accounts.json").then(function(data) {
      App.init(data);
    });
  });
});
