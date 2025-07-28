import React, { useEffect, useState } from 'react';
import Todo from "../components/Todo.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Gemini from '../components/Gemini.jsx';
const Dashboard = () => {
    const toggleInitialStyle = {
        margin: "5px"
    }
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [menuToggleStyle, setMenuToggleStyle] = useState(toggleInitialStyle);
    const [componentEditStatus, setComponentEditStatus] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loggedUser, setLoggedUser] = useState('');
    const [todoData, setTodoData] = useState([]);
    const [token, setToken] = useState('');
    const handleToggle = () => {
        if (!isOpen) {
            setMenuToggleStyle({
                margin: "5px",
                marginRight: "25%",

            })
        } else {
            setMenuToggleStyle(toggleInitialStyle);
        }
        setIsOpen(!isOpen);
    }

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
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.log("Error verifying token:", error);
                navigate('/login');
            }
        };
        verifyToken();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const user_logged = JSON.parse(localStorage.getItem('user'));
                const tokenFromStorage = localStorage.getItem('token');
                setToken(tokenFromStorage);
                setLoggedUser(user_logged?.name);

                const response = await axios.get("http://localhost:3000/todos", {
                    headers: {
                        Authorization: `Bearer ${tokenFromStorage}`
                    }
                });
                setTodoData(response.data.result);
            } catch (error) {
                console.error("Error fetching todos:", error.response?.data || error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isSidebar = event.target.closest('.sideBar');
            const isButton = event.target.closest('.menu-button');
            if (!isSidebar && !isButton) {
                setIsOpen(false);
                setMenuToggleStyle(toggleInitialStyle);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);


    const handleAddTodoComponent = async () => {
        try {
            const newComponent = {
                componentId: Date.now(),
                componentTitle: "Todo Gadget",
                componentType: "todo",
                todos: []
            };

            const response = await axios.post(
                "http://localhost:3000/add/component",
                newComponent,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const addedComponent = response.data.newComponent;
            setTodoData(prev => [...prev, addedComponent]);

        } catch (error) {
            console.error("Error updating todos:", error.response?.data || error.message);
        }
    };

    const handleAddGptComponent = async () => {
        // logic
        try {
            const newComponent = {
                componentId : Date.now(),
                componentTitle: "Gemini Gadget",
                componentType: "Gemini",
                recentResponse: ""
            };
            const response = await axios.post('http://localhost:3000/add/component', 
                newComponent,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const addedComponent = response.data.newComponent;
            setTodoData(prev => [...prev, addedComponent]);
        } catch (error) {
            console.log ("Error in adding gemini component : ", error.message);
        }
    }
    const handleDeleteComponent = (componentId) => {
        console.log("Before delete:", todoData.map(i => i.componentId));
        setTodoData(prev => {
            const updated = prev.filter(item => Number(item.componentId) !== Number(componentId));
            console.log("After delete:", updated.map(i => i.componentId));
            return updated;
        });
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><div>Loading...</div></div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-md shadow mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Welcome to Dashboard, {loggedUser}</h1>
                <div className={`flex gap-3 relative transition-transform duration-300 ${isOpen ? '-translate-x-112' : ''}`}>
                    <button onClick={() => setComponentEditStatus(!componentEditStatus)} className={"bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"}>
                        {!componentEditStatus ? "Edit Gadgets" : "Close Edit Gadgets"}
                    </button>
                    <button
                        onClick={handleToggle}
                        className="menu-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                        {isOpen ? "Close Gadget Menu" : "Open Gadget Menu"}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            {isOpen && (
                <div className="sideBar fixed top-0 right-0 w-1/4 h-full bg-white shadow-lg z-50 p-6 transition-all">
                    <div className="flex justify-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded shadow-sm">
                            <h3 className="text-md font-semibold text-gray-700">Todo Gadget</h3>
                            <button onClick={handleAddTodoComponent}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                                Add
                            </button>
                        </li>
                        <li className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded shadow-sm">
                            <h3 className="text-md font-semibold text-gray-700">Gemini Gadget</h3>
                            <button onClick={handleAddGptComponent}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                                Add
                            </button>
                        </li>
                    </ul>
                </div>
            )}
            {/* Todo Grid */}
            <div className="flex flex-wrap gap-4">
                {todoData
                    .filter(item => item !== null && item !== undefined)
                    .map((item) => {
                        switch (item.componentType) {
                            case "Gemini":
                                return <Gemini key={item.componentId} todoItem={item} onDelete={handleDeleteComponent} componentEditStatus={componentEditStatus} />
                            case "todo":
                                return <Todo key={item.componentId} todoItem={item} onDelete={handleDeleteComponent} componentEditStatus={componentEditStatus} />
                        }
                    })}
            </div>
        </div>
    );

};

export default Dashboard;