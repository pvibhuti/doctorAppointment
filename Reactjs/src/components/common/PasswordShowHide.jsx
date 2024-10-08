import React, { useState } from 'react';
import { Field } from 'formik';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const PasswordShowHide = ({ name , placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <div className="relative">
            <Field
                name={name}
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder={placeholder}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={togglePasswordVisibility}
            >
                {showPassword ?  <VisibilityIcon/> : <VisibilityOffIcon />}
            </button>
        </div>
    );
};

export default PasswordShowHide;