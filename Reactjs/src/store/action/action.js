import { Types } from "../actionType/actiontype";

export const ActionCreators = {
    ADD_TOKEN: (token) => ({
        type: Types.ADD_TOKEN,
        payload: { token }
    }),

    GET_DOCTOR: (doctorData) => ({
        type: Types.GET_DOCTOR,
        payload: { doctorData }
    }),

    GET_PATIENT: (patientData) => ({
        type: Types.GET_PATIENT,
        payload: { patientData }
    }),

    APPOINTMENT: (appointment) => ({
        type: Types.APPOINTMENT,
        payload: { appointment }
    }),
};