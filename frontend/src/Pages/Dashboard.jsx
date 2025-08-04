import { useNavigate } from "react-router-dom"
import React, { use, useEffect, useState } from 'react';
import axios from "axios";

export default function Dashboard() {
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [loggedUser, setLoggedUser] = useState('');
    const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [editor, setEditor] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [dashboardData, setDashboardData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('')
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const initialToken = localStorage.getItem('token');
                const response = await axios.post(
                    'http://localhost:3000/verify-token',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${initialToken}`
                        }
                    }
                );
                if (!response.data.status) {
                    navigate('/login');
                }
            } catch (error) {
                console.log("Error verifying token:", error);
                navigate('/login');
            }
        };
        verifyToken();
    }, []);


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        setLoggedUser(user);
        setToken(token);

        const fetchTableData = async () => {
            try {
                const dbResponse = await axios.get("http://localhost:3000/dashboard", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTableData(dbResponse.data);
            } catch (err) {
                console.error("Failed to fetch table data", err);
            }
        };

        if (user && token) fetchTableData();
    }, []);


    const handleDashboardData = async (e) => {
        e.preventDefault(); // Prevent default form submit behavior
        const data = {
            user_id: loggedUser.id,
            title,
            editor,
            ownerEmail: loggedUser.email
        };

        try {
            const response = await axios.post("http://localhost:3000/dashboard", data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newDashboard = response.data;

            setTableData(prev => [...prev, newDashboard]);

            setTitle('');
            setEditor('');
            setOwnerEmail('');
            setDashboardModalOpen(false);
        } catch (error) {
            console.log("Error adding new dashboard:", error.message);
            setErrorMessage("Failed to create dashboard.");
        }
    };


    const handleDeleteDashboard = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/dashboard/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Remove deleted dashboard from tableData
            setTableData(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Delete failed:", error.response?.data || error.message);
            alert("Failed to delete. Try again.");
        }
    };


    return (
        <div className="p-6 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-md shadow mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Welcome to Dashboard, {loggedUser.name}</h1>
                <div className={"flex gap-3 relative transition-transform duration-300"}>
                    <button onClick={() => setDashboardModalOpen(!dashboardModalOpen)} className={"bg-blue-500 text-white px-4 py-2 w-32 rounded hover:bg-blue-600 transition"}>
                        Create
                    </button>
                </div>
            </div>

            {/* modal */}
            {dashboardModalOpen && (
                <dialog onClick={() => setDashboardModalOpen(false)} id="todo_edit_modal" className="modal modal-open">
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleDashboardData}>
                            <h3 className="font-bold text-lg mb-2">Create Dashboard</h3>
                            <label><strong>Title</strong></label>
                            <input
                                className="input input-bordered w-full mb-2 focus:outline-none"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <label><strong>Editor</strong></label>
                            <select
                                className="select select-bordered w-full mb-4 focus:outline-none"
                                value={editor}
                                onChange={(e) => setEditor(e.target.value)}
                                required
                            >
                                <option value="">Select Editor</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>

                            {/* <label><strong>Owner Email</strong></label> */}
                            {/* <input
                                className="input input-bordered w-full mb-2 focus:outline-none"
                                placeholder="khizar@gmail.com"
                                type="email"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                required
                            /> */}
                            {(errorMessage.length > 0) && (<p style={{ color: "red" }}>{errorMessage}</p>)}

                            <div className="modal-action flex justify-end gap-2">
                                <button
                                    className="btn bg-green-500 hover:bg-green-700 text-white"
                                    type="submit"
                                >
                                    Create
                                </button>
                                <button
                                    className="btn bg-gray-500 hover:bg-gray-700 text-white"
                                    onClick={() => setDashboardModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}

            {/* Table */}
            <div className="w-ful flex justify-center align-center py-16">
                <div className="overflow-x-auto w-[90%] px-24">
                    {!(tableData.length > 0) && <div className="flex justify-center align-center"><p>No Dashboard yet.</p></div>}
                    {tableData.length > 0 && (<table className="table table-zebra">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Sr No.</th>
                                <th>Title</th>
                                <th>Visibility</th>
                                <th>Owner Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loggedUser && loggedUser.id && tableData
                                .filter(item =>
                                    item.editor === 'public' ||
                                    (item.editor === 'private' && item.user_id == loggedUser.id)
                                )
                                .map((item, index) => (
                                    <tr key={item.id || index}>
                                        <th>{index + 1}</th>
                                        <td>{item.title}</td>
                                        <td>{item.editor}</td>
                                        <td>{item.owneremail}</td>
                                        <td>
                                            <button onClick={() => navigate(`/dashboard/${item.id}`)} className="btn btn-xs bg-blue-500 text-white">View</button>
                                            {loggedUser.email === item.owneremail && (
                                                <button
                                                    onClick={() => handleDeleteDashboard(item.id)}
                                                    className="btn btn-xs bg-red-500 text-white ml-2"
                                                >
                                                    Delete
                                                </button>
                                            )}

                                        </td>
                                    </tr>
                                ))}

                        </tbody>

                    </table>)}
                </div>
            </div>
        </div>
    )
}
