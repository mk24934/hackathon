# Real-time Black-Scholes Option Pricing DAPP using the Quorum blockchain

Written by: Weini Chen, Jeremy Longfellow, Mark McAvoy, Yiyao Zhou

---
![alt text](./Marketplace-screenshot.png)

## Our project:

  We modify the MLH: Localhost Marketplace DAPP written on JPMorgan's Quorum Blockchain.  We allow the user to buy and sell Black-Schole call-priced derivatives over the DAPP Marketplace, using Google (GOOGL), Amazon (AMZN), Facebook (FB), Monster (MNST), Biogen Inc (BIIB), and the S&P500 (^GSPC), as the underlying asset.  Stock data is imported from Yahoo Finance updated every 300seconds written to a JSON file to be read in the marketplace reposity when compiled using truffle as the blockchain interperater.  To see this you must create and run your own blockchain too!  Here's how~
 
## How to start your own Quorum-Blockchain

Dependencies to install (note the second is mac-specific, replace "mac" with "windows" or "linux" if using these OS):

  1) Docker: http://mlhlocal.host/docker-hub
  2) Node.js: http://mlhlocal.host/node-mac
  3) Truffle: npm install -g truffle
  4) Blockchain: This Repository
  5) Note the original Marketplace-Quorum-Blockchain can be found at: http://mlhlocal.host/quorum-app
  
After installing these 4 items, go to terminal, cd to wherever you downloaded this repository, cd into mlh* and run:

> docker run -it -p 22000:22000 -p 22001:22001 -p22002:22002 mlhacks/mlh-localhost-quorum-network

This runs a local Quorum node on your computer.  Then in a new terminal script run:

> truffle compile

> truffle migrate --reset

> npm run seed

> npm start

Congratulations!  It should look like the picture above!

---
Notes when things go wrong~:
If you get the error the blockchain isn't running, even though it clearly is, restart it by hitting \<ctl c\> in terminal twice to abort it, the re-run the docker line.  If you still have issues try:

> docker container ls
 
> docker rm -f \<container-name\>
