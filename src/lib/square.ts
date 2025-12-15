
import square from 'square';
const { Client, Environment } = square;

const squareClient = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export default squareClient;
