import axios from 'axios';
import { API_URL } from '../../services/config';

const DecryptionProcess = async (response) => {
    if (response.data.mac && response.data.value) {
        try {
            const decryptionResponse = await axios.post(API_URL + '/decryptionProcess', {
                mac: response.data.mac,
                value: response.data.value
            });

            console.log("Decryption process Data: ", decryptionResponse.data);

            return decryptionResponse.data;
        } catch (error) {
            console.error("Error in decryption process:", error);
            throw error;
        }
    } else {
        throw new Error("Missing required data for decryption");
    }
};

export default DecryptionProcess;