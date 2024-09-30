const axios = require('axios');
// require('dotenv').config(); // Load environment variables from .env file

const KvmPayToken = async () => {
  try {
    const response = await axios.post(
      'https://api-live.kvmpay.com/payouts/OAuth/get-token',
      null,
      {
        headers: {
          'X-Api-Key': "b869dd48-e146-4c33-88c3-d4834a11fbba",//process.env.KvmpXApiKey,
          'X-Secret-key': "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY="//process.env.KvmpXApiKeySecret,
        }
      }
    );
    console.log("===response KvmPayToken>>", response.data);
    if(response.data && response.data.Access_token){
      return response.data.Access_token;
    }else{
      return "";
    }
  } catch (error) {
    console.error('Error occurred while fetching access token:', error);
    throw error;
  }
};

module.exports = KvmPayToken;
