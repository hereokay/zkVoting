const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const ip = process.env.END_POINT;


async function fetchUserList() {
    try {
        const response = await axios.get(`${ip}/user`);
        return response.data;
    } catch (error) {
        console.error('There was a problem with the Axios request:', error);
    }
  }


async function putUserSalt(user) {
    try {
        const response = await axios.put(
            `${ip}/user/${user['Code']}/salt`,
            { Salt: user['Salt'] },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('There was a problem with the Axios request:', error);
    }
}

async function putUserAddress(user) {
    try {
        const response = await axios.put(
            `${ip}/user/${user['Code']}/address`,
            { Address: user['Address'] },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('There was a problem with the Axios request:', error);
    }
}


async function getUserByCode(code){
    try {
        const response = await axios.put(
            `${ip}/user/${user['Code']}/address`,
            { Address: user['Address'] },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('There was a problem with the Axios request:', error);
    }
}

// 필요한 함수들을 export 합니다.
module.exports = {
    fetchUserList,
    putUserSalt,
    putUserAddress,
    getUserByCode
};