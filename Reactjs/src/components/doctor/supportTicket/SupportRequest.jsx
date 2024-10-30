import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../../security/axios';
import { IoIosArrowDropleftCircle } from "react-icons/io";

const SupportRequest = () => {
    const [applyTickets, setApplyTickets] = useState([]);
    const [selectedTicket, setSelectedTickets] = useState(null);
    const nevigate = useNavigate();

    useEffect(() => {
        fetchApplyTickets();
    }, []);

    const fetchApplyTickets = async () => {
        get("/getApplyTickets")
            .then((response) => {
                setApplyTickets(response.allTickets);
            })
            .catch((error) => {
                console.error('Error fetching ApplyTickets info:', error);
            })
    };

    const fetchSeletedTicket = async (ticket) => {
        get(`/getSelectedApplyTicket?id=${ticket._id}`)
            .then((response) => {
                setSelectedTickets(response.selectedTickets);
                nevigate("/doctor/supportChat", { state: response.selectedTickets })
            })
            .catch((error) => {
                console.error('Error fetching User info:', error);
            })
    };

    const handleViewTicket = (ticket) => {
        fetchSeletedTicket(ticket);
    };

    const handleBackToRequests = () => {
        nevigate("/doctor/dashboard")
    }
    return (
        <>
            <section id='supportRequest'>
                <div className="container mx-auto mt-5" >
                    <div className="flex justify-between items-center py-4 px-6 bg-blue-600 text-white rounded-t-lg">
                        <IoIosArrowDropleftCircle onClick={handleBackToRequests} className="text-4xl text-white font-semibold cursor-pointer" > Back </IoIosArrowDropleftCircle>
                        <h2 className="text-2xl font-semibold">Support Ticket </h2>
                        <div className="h-9 w-9 bg-yellow-500 flex items-center justify-center rounded-full text-white">VP</div>
                    </div>
                    <div className="flex flex-row bg-gray-100 shadow-lg rounded-b-lg">
                        <div className="w-full bg-white border-r p-10">
                            <h3 className="text-xl font-semibold mb-4 ml-4">Request List</h3>
                            <div className="overflow-y-auto h-[600px] mb-4 ml-4 p-5">
                                {applyTickets.map((applyTicket, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 border-b">
                                        <div>
                                            <div className="font-semibold">{applyTicket.userId.fullName}</div>
                                            <div className='flex flex-cols mt-2'><strong>Message </strong> :
                                                <div className="text-sm text-gray-500 mb-3 ml-2 mt-1">{applyTicket.message}</div>
                                            </div>
                                        </div>
                                        <div className='ml-2'>
                                            {applyTicket.status === 0 ?
                                                <button
                                                    onClick={() => handleViewTicket(applyTicket)}
                                                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                                >
                                                    Open
                                                </button>
                                                :
                                                <button
                                                    onClick={() => handleViewTicket(applyTicket)}
                                                    className="bg-red-400 text-white px-2 py-1 rounded mr-2"
                                                >
                                                    Closed
                                                </button>
                                            }

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SupportRequest;