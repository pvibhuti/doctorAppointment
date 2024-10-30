import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../../security/axios';
import { IoIosArrowDropleftCircle } from "react-icons/io";

const SupportRequest = () => {
    const [applyTickets, setApplyTickets] = useState([]);
    const nevigate = useNavigate();

    useEffect(() => {
        fetchApplyTickets();
    }, []);

    const fetchApplyTickets = async () => {
        get("/getPatientTicket")
            .then((response) => {
                setApplyTickets(response.selectedTicket);
            })
            .catch((error) => {
                console.error('Error fetching Tickets info:', error);
            })
    };

    const handleSelectTicket = (ticket) => {
        nevigate("/patient/supportChat", { state: ticket.applyTicket })
    };

    const handleBackToRequests = () => {
        nevigate("/patient/dashboard")
    };

    return (
        <>

            <div className="container mx-auto mt-5" >
                <div className="flex justify-between items-center py-4 px-6 bg-blue-600 text-white rounded-t-lg">
                    <IoIosArrowDropleftCircle onClick={handleBackToRequests} className="text-4xl text-white font-semibold cursor-pointer" > Back </IoIosArrowDropleftCircle>
                    <h2 className="text-2xl font-semibold">Support Requests </h2>
                    <div className="h-9 w-9 bg-yellow-500 flex items-center justify-center rounded-full text-white">VP</div>
                </div>
                <div className="flex flex-row bg-gray-100 shadow-lg rounded-b-lg">
                    <div className="w-full bg-white border-r p-10">
                        <h3 className="text-xl font-semibold mb-4 ml-4">Request List</h3>
                        <div className="overflow-y-auto h-[600px] mb-4 ml-4 p-5">
                            {applyTickets.length > 0 ? (
                                applyTickets.map((applyTicket, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 border-b cursor-pointer hover:bg-gray-100">
                                        <div>
                                            <div className="font-semibold">{applyTicket.userId.fullName}</div>
                                            <div className="text-sm text-gray-500"><strong>User Message:</strong> {applyTicket.message}</div>
                                            <div className="text-sm text-gray-500"><strong>Support TicketTitle:</strong> {applyTicket.suppotTicketId.subject}</div>
                                            {applyTicket.status === 1 ? (
                                                <p className="text-green-600 font-bold mt-2">This ticket is approved.</p>
                                            ) : applyTicket.status === 2 ? (
                                                <p className="text-red-600 font-bold mt-2">This ticket is rejected.</p>
                                            ) : (
                                                applyTicket.status === 0 && (
                                                    <p className="text-red-600 font-bold mt-2"></p>
                                                )
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleSelectTicket({
                                                applyTicket
                                            })}
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Chat
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No tickets available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SupportRequest;