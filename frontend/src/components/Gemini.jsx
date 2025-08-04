import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import axios from 'axios';
export default function Gemini({ todoItem, onDelete, componentEditStatus, editStatus }) {
    const [auth, setAuth] = useState(editStatus);
    const { id } = useParams();
    const [componentTitle, setComponentTitle] = useState(todoItem.componentTitle);
    const [editComponentTitle, setEditComponentTitle] = useState(false);
    const [editOptionStatus, setEditOptionStatus] = useState(false);
    const [editedComponentTitle, setEditedComponentTitle] = useState(componentTitle);
    const [menuStatus, setMenuStatus] = useState(false);
    const [recentResponse, setRecentResponse] = useState('');
    const [prompt, setPrompt] = useState('');
    const [token, setToken] = useState('');
    const [showMoreStatus, setShowMoreStatus] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [smallResponse, setSmallResponse] = useState('');
    const [loading, setLoading] = useState(false);

    // UseEffect Hooks
    useEffect(() => {
        const fetchToken = localStorage.getItem("token");
        setToken(fetchToken);
    }, []);

    useEffect(() => {
        if (todoItem?.recentResponse?.length <= 0) {
            setSmallResponse("No History found.");
        } else {
            if (todoItem?.recentResponse?.length > 0) {
                if (todoItem?.recentResponse?.length > 400) {
                    let smallResponse = todoItem.recentResponse.substring(0, 400);
                    smallResponse = smallResponse + "    .....";
                    setShowMoreStatus(true);
                    setSmallResponse(smallResponse);
                    setRecentResponse(todoItem.recentResponse);
                } else {
                    setSmallResponse(todoItem.recentResponse);
                }
            }
            setRecentResponse(todoItem.recentResponse);
        }
    }, [todoItem.recentResponse]);


    // Functions

    // Handle Prompt
    const handlePrompt = async (newPrompt) => {
        setLoading(true);

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
                        dashboardId : id,
                        componentType: "Gemini",
                        newResponse: response.data.data
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                )
                const fullResponse = response.data.data;
                setRecentResponse(fullResponse);
                setShowMoreStatus(fullResponse.length > 400);
                setSmallResponse(fullResponse.length > 400 ? fullResponse.substring(0, 400) + " ....." : fullResponse);
                setPrompt("");
                setLoading(false);

            } catch (error) {
                console.log("Error generating Response : ", error.message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
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
    const openModal = () => {
        setModalVisible(true);
    }


    return (
        <div className='bg-white rounded-lg shadow-md p-4 w-full max-w-lg border border-gray-300'>
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
            {(loading === false) && (<div className='p-4 bg-gray-100 justify-center align-center rounded-md w-full min-h-[150px]'>
                Response : <span className='text-black'>{smallResponse}</span>
                {showMoreStatus && (<button onClick={openModal} className='ml-2 text-blue-600 underline hover:text-blue-800'>
                    Show More
                </button>)}
            </div>)}

            {loading && (<div className='p-4 bg-gray-100 justify-center align-center rounded-md w-full min-h-[150px]'>
                Loading.....
            </div>)}


            {/* Prompt input */}
            {auth && componentEditStatus && (<div className='flex justify-left items-center w-full max-w-lg pt-4 gap-2'>
                <input className='input min-w-102 rounded-md focus:outline-none' type='text' placeholder='Enter Prompt' value={prompt} onKeyDown={(e) => { if (e.key === 'Enter') handlePrompt(prompt) }} onChange={(e) => setPrompt(e.target.value)} required />
                <button onClick={() => handlePrompt(prompt)} className='btn bg-blue-500 w-16 text-white'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
            </div>)}

            {/* Modal */}
            {modalVisible && (<dialog id="todo_edit_modal" className="modal modal-open" onClick={() => setModalVisible(false)}>
                <div className="modal-box w-[80%] h-[50%] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-bold text-lg mb-2">Full Response</h3>

                    <div className="flex-grow overflow-y-auto mb-4">
                        <p className="text-lg">{recentResponse}</p>
                    </div>

                    <div className="modal-action flex justify-end gap-2">
                        <button
                            className="btn bg-green-500 hover:bg-green-700 text-white"
                            onClick={() => setModalVisible(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </dialog>
            )}
        </div>
    )
}
