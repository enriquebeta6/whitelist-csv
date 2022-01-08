// Dependencies
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { Router } from 'express';

import provider from '../provider';
import ToysLegendWhiteList from '../contracts/ToysLegendWhiteList';

const router = Router();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const toysLegendWhiteListReadOnly = 
  new ethers.Contract(ToysLegendWhiteList.address, ToysLegendWhiteList.abi, provider);

const toysLegendWhiteListSigner = 
  new ethers.Contract(ToysLegendWhiteList.address, ToysLegendWhiteList.abi, wallet);

router.get('/add-wallets', async (_, res) => {
  let allRows = []
  const walletsToAdd = new Set([]);
  const addedWallets = new Set([]);
  const notAddedWallets = new Set([]);

  try {
    console.time('add-wallets');

    const filesPath = path.join(__dirname, 'csv');
    const files = fs.readdirSync(filesPath)
  
    for (const file of files) {
      const filePath = path.join(filesPath, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const rows = fileContent.split('\n')
      
      allRows = [...allRows, ...rows]
    }
  
    for (const row of allRows) {
      if (!row || row.includes('Reservado')) continue;
      
      const [address] = row.split(',')
  
      walletsToAdd.add(address.replace(/(\\r|\\n|\s)+/g, ''))
    }
  
    for (const address of walletsToAdd) {
      const isWhitelisted = await toysLegendWhiteListReadOnly.isWhitelisted(address)
  
      if (isWhitelisted) {
        notAddedWallets.add(address)

        console.log(`${address} is already whitelisted`)

        continue;
      }
  
      await toysLegendWhiteListSigner.add(address)
      addedWallets.add(address)

      console.log(`${address} added to whitelist`)
    }

    console.timeEnd('add-wallets');

    res.json({
      totalAddedWallets: addedWallets.size,
      addedWallets: Array.from(addedWallets),
      totalNotAddedWallets: notAddedWallets.size,
      notAddedWallets: Array.from(notAddedWallets),
    })
  } catch(error) {
    console.error(error)

    res.send('error')
  }
})

export default router 