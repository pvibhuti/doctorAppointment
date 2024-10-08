import React from "react";
import { toast } from 'react-toastify';

export function toastMessage(type, message) {
    if (type === 'success') {
        toast.success(message);
    } else if (type === 'error') {
        toast.error(message);
    } else {
        toast(message); 
    }
}
