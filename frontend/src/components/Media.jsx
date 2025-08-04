import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import axios from 'axios';
export default function Media({ todoItem, onDelete, componentEditStatus, editStatus }) {
    // state variables
    const [auth, setAuth] = useState(editStatus);
    const { id } = useParams();
    const [editComponentTitle, setEditComponentTitle] = useState(false);
    const [componentTitle, setComponentTitle] = useState(todoItem.componentTitle);
    const [editOptionStatus, setEditOptionStatus] = useState(false);
    const [editedComponentTitle, setEditedComponentTitle] = useState(componentTitle);
    const [token, setToken] = useState('');
    const [menuStatus, setMenuStatus] = useState(false);
    const [inputUrl, setInputUrl] = useState('');
    const [url, setUrl] = useState('');
    const [mediaVisible, setMediaVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // UseEffect Hooks
    useEffect(() => {
        const fetchToken = localStorage.getItem("token");
        setToken(fetchToken);
    }, []);

    useEffect(() => {
        if (todoItem.mediaURL) {
            setUrl(todoItem.mediaURL);
            setMediaVisible(true);
        } else if (!todoItem.mediaURL) {
            setMediaVisible(false);
        }
    }, [todoItem.mediaURL])

    // functions
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
    const editTodoComponent = () => {
        setMenuStatus(false);
        setEditOptionStatus(!editOptionStatus);
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
    const handleChange = (e) => {
        const inputUrl = e.target.value;
        setInputUrl(inputUrl);
    };
    const handleMedia = async () => {
        setLoading(true);
        setUrl(inputUrl);
        if (ReactPlayer.canPlay(inputUrl)) {
            setMediaVisible(true);
        } else {
            setMediaVisible(false);
        }

        // update recent response in db
        const dbResponse = await axios.post("http://localhost:3000/updateRecentResponse",
            {
                componentId: todoItem.componentId,
                componentType: "Media",
                url: inputUrl,
                dashboardId : id
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        )
        setLoading(false);
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

            {/* Media Content */}
            {!loading && (<div className='p-4 bg-gray-100 flex flex-col items-center justify-center gap-4 rounded-md w-full min-h-[200px]'>
                {mediaVisible && (
                    <ReactPlayer src={url} loop controls muted width={400} />
                )}

                {!mediaVisible && (<div> No Media</div>)}
            </div>)}

            {loading && (<div className='p-4 bg-gray-100 flex flex-col items-center justify-center gap-4 rounded-md w-full min-h-[200px]'>
                <p>Loading ....</p>
            </div>)}

            {/* Input */}
            {auth && componentEditStatus && <div className='flex justify-left items-center w-full max-w-lg pt-4 gap-2'>
                <input
                    type="text"
                    value={inputUrl}
                    onChange={handleChange}
                    placeholder="Enter youtube video URL"
                    className="input min-w-102 rounded-md focus:outline-none w-full"
                />
                <button onClick={handleMedia} className='btn bg-blue-500 w-16 text-white'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
            </div>}
        </div>
    );

}
