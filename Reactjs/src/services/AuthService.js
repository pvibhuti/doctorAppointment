import { API_URL } from "./config";


export const Login = async () => {
    try {
        const response = await axios.post(`${API_URL}/loginPatient`, values);
        console.log("Login Patient", response.data);

        const decrypt = await DecryptionProcess(response);
        console.log("decrypt for Patient Login ", decrypt);

        if (decrypt) {
            localStorage.setItem("token", decrypt.token);
            alert('Login Successfully.');
            navigate("/patientDashboard");
        } else {
            console.error('Unexpected data format after decryption:', decrypt);
            alert('Login Failed.');
            navigate("/login");
        }

    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.data) {
            toast.error(error.response.data.message || 'Something went wrong');
        } else {
            toast.error('Network error. Please try again.');
        }
    }
}
