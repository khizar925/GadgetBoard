import React, { useEffect, useState } from 'react'
import axios from 'axios';
export default function Gemini({ todoItem, onDelete, componentEditStatus }) {
    // console.log("From Gemini JSX : ", todoItem);
    const [componentTitle, setComponentTitle] = useState(todoItem.componentTitle);
    const [editComponentTitle, setEditComponentTitle] = useState(false);
    const [editOptionStatus, setEditOptionStatus] = useState(false);
    const [editedComponentTitle, setEditedComponentTitle] = useState(componentTitle);
    const [menuStatus, setMenuStatus] = useState(false);
    const [recentResponse, setRecentResponse] = useState(todoItem.recentResponse);
    const [prompt, setPrompt] = useState('');
    const [token, setToken] = useState('');

    // UseEffect Hooks
    useEffect(() => {
        const fetchToken = localStorage.getItem("token");
        setToken(fetchToken);
    }, []);

    // Functions

    // 1. Handle Prompt
    const handlePrompt = async (newPrompt) => {
        if (newPrompt.trim().length >= 2) {
            try {
                const response = await axios.post("http://localhost:3000/generate-response",
                    { prompt: newPrompt },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                )

                // update recent response in db
                const dbResponse = await axios.post("http://localhost:3000/updateRecentResponse",
                    {
                        componentId: todoItem.componentId,
                        newResponse: response.data.data
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                )
                setRecentResponse(response.data.data)
                setPrompt("")
            } catch (error) {
                console.log("Error generating Response : ", error.message);
            }
        }
    }
    const editComponentTitleFunction = () => setEditComponentTitle(true);
    const saveComponentTitle = async () => {
        try {
            await axios.post(
                "http://localhost:3000/todos/update-title",
                {
                    componentId: todoItem.componentId,
                    newTitle: editedComponentTitle,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setComponentTitle(editedComponentTitle);
            setEditComponentTitle(false);
        } catch (err) {
            console.error("Failed to update component title:", err.response?.data || err.message);
        }
    };
    const cancelComponentTitleEdit = () => {
        setEditedComponentTitle(componentTitle);
        setEditComponentTitle(false);
    };

    const deleteTodoComponent = async (componentId) => {
        try {
            await axios.post(
                "http://localhost:3000/todos/delete-component",
                { componentId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            onDelete(componentId);
        } catch (err) {
            console.error("Failed to delete component:", err.response?.data || err.message);
        }
    };

    const editTodoComponent = () => {
        setMenuStatus(false);
        setEditOptionStatus(!editOptionStatus);
    };


    return (
        <div className='bg-white rounded-lg shadow-md p-4 w-full max-w-lg'>
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {!editComponentTitle ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800">{componentTitle}</h2>
                            {editOptionStatus && componentEditStatus && (
                                <button
                                    onClick={editComponentTitleFunction}
                                    className="px-2 py-1 text-blue-600 hover:text-blue-800"
                                    title="Edit Component Title"
                                >
                                    ✏️
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex gap-2 items-center w-full">
                            <input
                                value={editedComponentTitle}
                                onChange={(e) => setEditedComponentTitle(e.target.value)}
                                className="border rounded-md px-2 py-1 text-base flex-grow"
                            />
                            <button onClick={saveComponentTitle} className="text-green-600 hover:text-green-800">✔</button>
                            <button onClick={cancelComponentTitleEdit} className="text-red-600 hover:text-red-800">✖</button>
                        </div>
                    )}
                </div>

                {/* Menu */}
                {componentEditStatus && (
                    <div className="relative">
                        <button onClick={() => setMenuStatus(!menuStatus)} className="menu-button px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            ☰
                        </button>
                        {menuStatus && (
                            <div className="absolute right-0 mt-2 w-42 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 dropdown-menu">
                                <button
                                    onClick={editTodoComponent}
                                    className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                                >
                                    {editOptionStatus ? "Cancel Edit Gadget" : "Edit Gadget"}
                                </button>
                                <button
                                    onClick={() => deleteTodoComponent(todoItem.componentId)}
                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                >
                                    Delete Gadget
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Response */}
            {(todoItem.recentResponse.length === 0) &&
                <div className='p-4 bg-gray-100 justify-center align-center rounded-md w-full min-h-[150px]'>
                    <span className='text-black'> No History Found</span>
                </div>}

            {(todoItem.recentResponse.length > 0) && <div className='p-4 bg-gray-100 justify-center align-center rounded-md w-full min-h-[150px]'>
                Response : <span className='text-black'>{recentResponse}</span>
            </div>}

            {/* Prompt input */}
            <div className='flex justify-left items-center w-full max-w-lg pt-4 gap-2'>
                <input className='input min-w-102 rounded-md focus:outline-none' type='text' placeholder='Enter Prompt' value={prompt} onKeyDown={(e) => { if (e.key === 'Enter') handlePrompt(prompt) }} onChange={(e) => setPrompt(e.target.value)} required />
                <button onClick={() => handlePrompt(prompt)} className='btn bg-blue-500 w-16 text-white'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
