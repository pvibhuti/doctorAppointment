import axios from 'axios';
import { API_URL } from '../../services/config';
import Security from '../../security/Security';

const DecryptionProcess = async (response) => {

    if (response.data.mac !== undefined) {
        response.data = new Security().decrypt(response.data)
        return response.data;
    }

    return response;
};

export default DecryptionProcess;