import { Types } from '../actionType/actiontype';
import { combineReducers } from 'redux';

const initialDoctorState = {};
const initialPatientState = {};
const initialTokenState = null;
const initialAppointmentState = [];

const doctorReducer = (state = initialDoctorState, action) => {
    switch (action.type) {
        case Types.GET_DOCTOR:
            return action.payload.doctorData;
        default:
            return state;
    }
};

const patientReducer = (state = initialPatientState, action) => {
    switch (action.type) {
        case Types.GET_PATIENT:
            return action.payload.patientData;
        default:
            return state;
    }
};

const tokenReducer = (state = initialTokenState, action) => {
    switch (action.type) {
        case Types.ADD_TOKEN:
            return action.payload.token;
        default:
            return state;
    }
};

const appointmentReducer = (state = initialAppointmentState, action) => {
    switch (action.type) {
        case Types.APPOINTMENT:
            return action.payload.appointment;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    doctorProfile: doctorReducer,
    patientProfile: patientReducer,
    token: tokenReducer,
    Appointments: appointmentReducer,
});

export default rootReducer;