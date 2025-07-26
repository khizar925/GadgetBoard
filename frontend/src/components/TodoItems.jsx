export default function TodoItems({ todos, handleDelete, handleEdit, handleCompleted }) {
  const btnStyle = {
    padding: "12px",
    backgroundColor: "#3D74B6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    marginRight: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  };

  if (!todos.length) return <p style={{ fontStyle: "italic", color: "#555" }}>No todos yet.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {todos.map((todo, index) => (
        <div
          key={index}
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ margin: "0 0 6px", color: "#333" }}>Title: {todo.title}</h3>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Description: </strong> {todo.description}</p>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Creation Date & Time: </strong>{new Date(todo.created_at).toLocaleString()}</p>
          <p style={{ margin: "4px 0", fontSize: "20px" }}>
            <strong>Completed:</strong> {todo.completed ? "Yes" : "No"}
          </p>
          <button style={btnStyle} onClick={() => handleCompleted(todo.id, todo.completed)}>{todo.completed ? "Mark as UnDone" : "Mark as Done"}</button>
          <button style={btnStyle} onClick={() => handleEdit(todo)}>Edit</button>
          <button style={btnStyle} onClick={() => handleDelete(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
