
import { Client, Environment } from 'square';

const squareClient = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export default squareClient;
