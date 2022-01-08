// Dependencies
import { ethers } from 'ethers';
import { Router } from 'express';

import provider from '../provider';

// Contracts
import ToysLegendWhiteList from '../contracts/ToysLegendWhiteList';
import ToysLegendDonation from '../contracts/ToysLegendDonation';

const router = Router();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const toysLegendWhiteListReadOnly = 
  new ethers.Contract(ToysLegendWhiteList.address, ToysLegendWhiteList.abi, provider);

const toysLegendDonationSigner = 
  new ethers.Contract(ToysLegendDonation.address, ToysLegendDonation.abi, wallet);

router.get('/transfer-ownership', async (_, res) => {
  try {
    const oldOwner = await toysLegendWhiteListReadOnly.owner();
    
    const returnOwnerToWhitelistTx = await toysLegendDonationSigner.callStatic.returnOwnerToWhitelist();

    console.log('returnOwnerToWhitelistTx ', returnOwnerToWhitelistTx);

    // await returnOwnerToWhitelistTx.wait();

    const newOwner = await toysLegendWhiteListReadOnly.owner();

    res.send(`Transfer Ownership: ${oldOwner} -> ${newOwner}`);
  } catch(error) {
    console.error(error)

    res.send('error')
  }
})

export default router 