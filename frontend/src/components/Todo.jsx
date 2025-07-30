import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Todo = ({ todoItem, onDelete, componentEditStatus }) => {
    const [componentTitle, setComponentTitle] = useState(todoItem.componentTitle);
    const [title, setTitle] = useState('');
    const [searchTitle, setsearchTitle] = useState('');
    const [todos, setTodos] = useState(todoItem.todos || []);
    const [menuStatus, setMenuStatus] = useState(false);
    const [editOptionStatus, setEditOptionStatus] = useState(false);
    const [editID, setEditId] = useState(null);
    const [editComponentTitle, setEditComponentTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [token, setToken] = useState();
    const [editedComponentTitle, setEditedComponentTitle] = useState(componentTitle);
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [editDescription, setEditDescription] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [editDueTime, setEditDueTime] = useState('');
    const [editPriority, setEditPriority] = useState('Normal');
    const [editTodoModalOpen, setEditTodoModalOpen] = useState(false);
    const [addTodoForm , setAddTodoForm] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [searchForm, setSearchForm] = useState(false);


    useEffect(() => {
        const fetchedToken = localStorage.getItem('token');
        setToken(fetchedToken);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isButton = event.target.closest('.menu-button');
            const isDropdown = event.target.closest('.dropdown-menu');
            if (!isButton && !isDropdown) {
                setMenuStatus(false);
            }
        };

        if (menuStatus) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuStatus]);

    useEffect(() => {
        if (!hasMounted) {
            setHasMounted(true);
            return;
        }

        if (!componentEditStatus) {
            setEditOptionStatus(false);
            setAddTodoForm(false);
        }
    }, [componentEditStatus, hasMounted]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const newTodo = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            dueDate,
            dueTime,
            priority,
        };

        try {
            const response = await axios.post(
                'http://localhost:3000/todos/update-component',
                {
                    componentId: todoItem.componentId,
                    componentTitle: "Todo Gadget",
                    editMode: false,
                    newTodo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updated = response.data.updatedTodos.find(c => c.componentId === todoItem.componentId);
            if (updated) setTodos(updated.todos);

            setTitle('');
            setDescription('');
            setDueDate('');
            setDueTime('');
            setPriority('Normal');
        } catch (err) {
            console.error('Failed to update component todos:', err.response?.data || err.message);
        }
    };

    const submitSearch = async () => {
        try {
            const searchedTodos = await axios.get(`http://localhost:3000/search/${searchTitle}/${todoItem.componentId}`, {headers: {Authorization: `Bearer ${token}`}});
        } catch (error) {
            console.log("Error while searching : ", error.message);
        }
    }

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

    const editTodo = (id) => {
        const todoToEdit = todos.find(t => t.id === id);
        if (todoToEdit) {
            setEditId(id);
            setEditTitle(todoToEdit.title || '');
            setEditDescription(todoToEdit.description || '');
            setEditDueDate(todoToEdit.dueDate || '');
            setEditDueTime(todoToEdit.dueTime || '');
            setEditPriority(todoToEdit.priority || 'Normal');
            setEditTodoModalOpen(true);
        }
    };


    const cancelEdit = () => {
        setEditId(null);
        setEditTitle('');
    };

    const saveTodo = async (id) => {
        try {
            const response = await axios.post(
                'http://localhost:3000/todos/update-component',
                {
                    componentId: todoItem.componentId,
                    newTodo: {
                        id,
                        title: editTitle,
                        description: editDescription,
                        dueDate: editDueDate,
                        dueTime: editDueTime,
                        priority: editPriority,
                    },
                    editMode: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updated = response.data.updatedTodos.find(c => c.componentId === todoItem.componentId);
            if (updated) setTodos(updated.todos);
            cancelEdit();
            setEditTodoModalOpen(false);
        } catch (err) {
            console.error('Failed to update todo:', err.response?.data || err.message);
        }
    };


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
    const deleteTodo = async (id) => {
        try {
            const response = await axios.post(
                'http://localhost:3000/todos/delete',
                {
                    componentId: todoItem.componentId,
                    todoId: id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updated = response.data.updatedTodos.find(c => c.componentId === todoItem.componentId);
            if (updated) setTodos(updated.todos);

        } catch (err) {
            console.error('Failed to delete todo:', err.response?.data || err.message);
        }
    };

    const handleAddTodo = () => {
        if (componentEditStatus) {
            setMenuStatus(false);
            setAddTodoForm(!addTodoForm);
        }
    };
    const handleSearch = () => {
        if (componentEditStatus) {
            setSearchForm(false);
        }
    };

    const searchTodos = () => {
        setSearchForm(!searchForm);
        setMenuStatus(!menuStatus);
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-lg border border-gray-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {!editComponentTitle ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800">{componentTitle}</h2>
                            {editOptionStatus && (
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
                                    onClick={searchTodos}
                                    className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                                >
                                    {searchForm ? "Cancel Search" : "Search Todos"}
                                </button>
                                <button
                                    onClick={handleAddTodo}
                                    className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                                >
                                    {addTodoForm ? "Cancel Add Todo" : "Add New Todo"}
                                </button>
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

            {/* Form */}
            {addTodoForm && (<form onSubmit={handleSubmit} className="space-y-2 mb-4">
                <input
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full border rounded-md px-4 py-2 text-base"
                    required
                />
                <input
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full border rounded-md px-4 py-2 text-base"
                />
                <div className="flex gap-2">
                    <input
                        type="date"
                        name="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border rounded-md px-4 py-2 text-base"
                    />
                    <input
                        type="time"
                        name="dueTime"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full border rounded-md px-4 py-2 text-base"
                    />
                </div>
                <select
                    name="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-base"
                >
                    <option value="Low">Low Priority</option>
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                </select>
                <button type="submit" className="w-0.8/2 mr-2 bg-blue-500 text-white px-5 py-2 rounded-lg text-lg hover:bg-blue-600">
                    Add Todo
                </button><button onClick={handleAddTodo} className="w-0.8/2 m-2 bg-blue-500 text-white px-5 py-2 rounded-lg text-lg hover:bg-blue-600">
                    Cancel Todo
                </button>
            </form>)}


            {/* Search Form */}
            {searchForm && (<form onSubmit={submitSearch} className="space-y-2 mb-4">
                <input
                    name="Search"
                    value={searchTitle}
                    onChange={(e) => setsearchTitle(e.target.value)}
                    placeholder="Search from Titles ..."
                    className="w-full border rounded-md px-4 py-2 text-base"
                    required
                />
                <button type="submit" className="w-0.8/2 mr-2 bg-blue-500 text-white px-5 py-2 rounded-lg text-lg hover:bg-blue-600">
                    Search
                </button>
                <button onClick={handleSearch} className="w-0.8/2 m-2 bg-blue-500 text-white px-5 py-2 rounded-lg text-lg hover:bg-blue-600">
                    Cancel
                </button>
            </form>)}

            {/* Todos */}
            <div className="max-h-64 overflow-y-auto pr-1">
                <strong>Your Todos</strong>
                <br/>
                <br/>
                {todos.length === 0 ? "No Todos" : ""}
                <ul className="space-y-2">
                    {todos.map((t, index) => (
                        <li key={t.id} className="bg-gray-100 px-3 py-2 rounded">
                            <div className="flex justify-between items-start">
                                {editID !== t.id ? (
                                    <div className="text-base">
                                        <div className="font-semibold">
                                            <strong>Todo # {index + 1}</strong> :
                                            <br/>
                                            <strong>Title : </strong> {t.title}
                                            <br/>
                                            <strong>Description : </strong> {t.description}
                                            <br/>
                                            <strong>Priority : </strong> {t.priority}
                                            <br/>
                                            <strong>DueDate : </strong> {t.dueDate}
                                            <br/>
                                            <strong>Due Time : </strong> {t.dueTime}
                                            <br/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1 w-full">
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full border rounded-md px-4 py-2 text-base"
                                        />
                                    </div>
                                )}
                                {editOptionStatus && editID !== t.id && (
                                    <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                                        <button onClick={() => deleteTodo(t.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke-width="1.5" stroke="currentColor" className="size-6">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                            </svg>
                                        </button>
                                        <button onClick={() => editTodo(t.id)}
                                                className="text-blue-600 hover:text-blue-800 text-base ml-2">
                                            ✏️
                                        </button>
                                    </div>
                            )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {editTodoModalOpen && (
                <dialog id="todo_edit_modal" className="modal modal-open">
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-2">Edit Todo</h3>
                        <label><strong>Title</strong></label>
                        <input
                            className="input input-bordered w-full mb-2"
                            placeholder="Title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <label><strong>Description</strong></label>
                        <input
                            className="input input-bordered w-full mb-2"
                            placeholder="Description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <label><strong>Date</strong></label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                        />
                        <label><strong>Time</strong></label>
                        <input
                            type="time"
                            className="input input-bordered w-full"
                            value={editDueTime}
                            onChange={(e) => setEditDueTime(e.target.value)}
                        />
                        <label><strong>Priority</strong></label>
                        <select
                            className="select select-bordered w-full mb-4"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                        >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                        </select>

                        <div className="modal-action flex justify-end gap-2">
                            <button
                                className="btn bg-green-500 hover:bg-green-700 text-white"
                                onClick={() => saveTodo(editID)}
                            >
                                Save
                            </button>
                            <button
                                className="btn bg-gray-500 hover:bg-gray-700 text-white"
                                onClick={() => {
                                    cancelEdit();
                                    setEditTodoModalOpen(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

        </div>
    );
};

export default Todo;