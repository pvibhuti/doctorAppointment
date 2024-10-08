import AxiosMiddleware from "../security/axios";
import DecryptionProcess from "../components/common/decrypt";
import { toastMessage } from "../components/helpers/Toast";

const errorHandler = (err) => {
  const statusCode = err.response?.status ?? 0;
  const data = {
    errorData: '',
    statusCode,
    message: '',
  };

  if (err.response && err.response.data && err.response.data.message && statusCode !== 401) {
    toastMessage( 'error',err.response.data.message);
  }

  if (statusCode === 400 || statusCode === 401 || statusCode === 422) {
    data.errorData = err.response?.data?.errors ?? '';
    data.message = err.response?.data?.message ?? '';
  }

  return data;
};

const AuthService = {
  registration: (data, url) => {
    console.log("data", data);
    debugger;
    return new Promise((resolve, reject) => {
      AxiosMiddleware('post', url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          console.log("error", err);
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
          DecryptionProcess(response)
            .then((decrypted) => {
              if (decrypted) {
                localStorage.setItem("token", decrypted.data.token);                
                resolve(decrypted);
              } else {
                reject('Decryption failed.');
              }
            })
            .catch((err) => {
              reject('Error during decryption process: ' + err);
            });
        })
        .catch((err) => {
          if (err.response.data && err.response.data.message) {
            toastMessage('error', Object.values(err.response.data).toString());
            // toastMessage('error', err.response.data.message || 'Login Failed. Please check your credentials.');
          } else {
            toastMessage('error', 'Login Failed. Try again.');
          }
        });
    });
  },
};

export default AuthService;