import { Types } from '../actionType/actiontype';

const initialState = {
    doctorProfile: {},
    patientProfile: {},
    token: null,
    appointments: []
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case Types.GET_DOCTOR:
            return {
                ...state,
                doctorProfile: action.payload.doctorData
            };

        case Types.GET_PATIENT:
            return {
                ...state,
                patientProfile: action.payload.patientData
            };

        case Types.ADD_TOKEN:
            return {
                ...state,
                token: action.payload.token
            };

        case Types.APPOINTMENT:
            return {
                ...state,
                appointments: action.payload.appointment
            };

        default:
            return state;
    }
};

export default rootReducer;