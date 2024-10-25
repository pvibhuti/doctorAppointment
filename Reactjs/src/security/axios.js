import axios from "axios";
import { API_URL } from "../services/config";
import Security from "./Security";
import { toastMessage } from "../components/helpers/Toast";

function AxiosMiddleware(method, url, data, options) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    // axios.defaults.headers.common['env'] = "test";
    // axios.defaults.headers.common['Content-Type'] = ['multipart/form-data'];
    // !(data instanceof FormData)
    const contentType = options && options.headers && options.headers['Content-Type'] === 'multipart/form-data';
  
    if (data && !contentType) {
        data = new Security().encrypt(data);
    }

    switch (method) {
        case 'get':
            return axios.get(url, data, options);

        case 'post':
            return axios.post(url, data, options);

        case 'patch':
            return axios.patch(url, data, options);

        case 'head':
            return axios.head(url, data, options);

        case 'put':
            return axios.put(url, data, options);

        case 'delete':
            return axios.delete(url, { data: data, headers: options });
    }
}

export function get(url, data = [], options = {}) {
    return AxiosMiddleware('get', API_URL + url, data, options)
}
export function post(url, data = [], options = {}) {
    return AxiosMiddleware('post', API_URL + url, data, options)
}

export function patch(url, data = [], options = {}) {
    return AxiosMiddleware('patch', API_URL + url, data, options)
}

export function deleteAPI(url, data = [], options = {}) {
    return AxiosMiddleware('delete', API_URL + url, data, options)
}

axios.interceptors.response.use(
    (response) => {
        if (response.data.mac !== undefined) {
            response = new Security().decrypt(response.data)
            return response;
        }
        return response
    },
    (error) => {
        if (error.response.status === 423) {
            localStorage.clear()
        }
        if (error.response.status === 401) {
            var userdata = localStorage.getItem('token');
            if (userdata) {
                toastMessage('error', error.response.data.message);
            }
            localStorage.clear()
        }
        return Promise.reject(error);
    }
)

export default AxiosMiddleware;