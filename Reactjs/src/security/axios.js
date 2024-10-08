import axios from "axios";
import { API_URL } from "../services/config";

function AxiosMiddleware(method, url, data, options) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    axios.defaults.headers.common['env'] = "test";
    // axios.defaults.headers.common['Content-Type'] = ['multipart/form-data'];

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

export default AxiosMiddleware;