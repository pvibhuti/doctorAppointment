import AxiosMiddleware from "../security/axios";
import DecryptionProcess from "../components/common/decrypt";
import { toastMessage } from "../components/helpers/Toast";
import Security from "../security/Security";
import BookAppointment from "../components/patient/appointment/bookAppintment";
import { API_URL } from "./config";

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

const AppointmentService = {
    bookAppointment: (data) => {
        return new Promise((resolve, reject) => {
            AxiosMiddleware('post', `${API_URL}/bookAppointment`, data)
                .then((response) => {
                    toastMessage('success', "Appointment Booked Successfully.")
                    resolve(response);
                })
                .catch((err) => {
                    const errorData = errorHandler(err);
                    if (err.response && err.response.data.message) {
                        const errorMessage = err.response.data.message;
                        if (errorMessage.includes('already scheduled') || errorMessage.includes('within 30 minutes')) {
                            toastMessage('error', errorMessage);
                        } else {
                            toastMessage('error', Object.values(err.response.data).toString());
                        }
                    } else {
                        toastMessage('error', Object.values(err.response.data).toString());
                    }
                    reject(errorData);
                });
        });
    },

};

export default AppointmentService;