// Dependencies
import express from 'express';

// Routes
import addWallets from './routes/addWallets';
import transferOwnership from './routes/transferOwnership';

const app = express()
const port = process.env.PORT || 3000

app.use(addWallets)
app.use(transferOwnership)

app.listen(port, () => {
  console.log(`
    Server listening on port ${port}

    Network: ${process.env.NETWORK}
    RPC URL: ${process.env.RPC_URL}
  `)
})