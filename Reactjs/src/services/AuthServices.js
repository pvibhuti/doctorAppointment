import AxiosMiddleware from "../security/axios";
import DecryptionProcess from "../components/common/decrypt";
import { toastMessage } from "../components/helpers/Toast";
import Security from "../security/Security";

const errorHandler = (err) => {
  const statusCode = err.response?.status ?? 0;
  const data = {
    errorData: '',
    statusCode,
    message: '',
  };

  if (err.response && err.response.data && err.response.data.message && statusCode !== 401) {
    toastMessage('error', err.response.data.message);
  }

  if (statusCode === 400 || statusCode === 401 || statusCode === 422) {
    data.errorData = err.response?.data?.errors ?? '';
    data.message = err.response?.data?.message ?? '';
  }

  return data;
};

const AuthService = {
  registration: (url, data) => {
    return new Promise((resolve, reject) => {
      AxiosMiddleware('post', url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          const errorData = errorHandler(err);
          if (err.response && err.response.data) {
            toastMessage('error', Object.values(err.response.data).toString());
          } else {
            toastMessage('error', 'An unexpected error occurred. Please try again.');
          }
          reject(errorData);
        });
    });
  },

  login: (data, url) => {
    return new Promise((resolve, reject) => {
      AxiosMiddleware('post', url, data)
        .then((response) => {
          localStorage.setItem("token", response.token);
          resolve(response);
        })
        .catch((err) => {
          if (err.response.data && err.response.data.message) {
            toastMessage('error', Object.values(err.response.data).toString());
          } else {
            toastMessage('error', 'Login Failed. Try again.');
          }
        });
    });
  },
};

export default AuthService;