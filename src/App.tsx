import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";
import { nanoid } from "nanoid";
import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const MessageItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const MessageText = styled.p`
  margin: 0;
  flex-grow: 1;
`;

const Checkbox = styled.input`
  margin-right: 1rem;
`;

const ActionButton = styled.button`
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #5a6268;
  }
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  position: absolute;
  top: 1rem;
  right: 1rem;

  &:hover {
    background-color: #c82333;
  }
`;

function App() {
  const licenseKey = import.meta.env.VITE_REPLICACHE_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error("Missing VITE_REPLICACHE_LICENSE_KEY");
  }
  const token = localStorage.getItem("token");
  const [r, setR] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const r = new Replicache({
      name: "chat-user-id",
      licenseKey,
      mutators: {
        async createMessage(tx, { id, title }) {
          await tx.set(`message/${id}`, {
            title,
            completed: false,
          });
        },
        async updateMessage(tx, { id, title, completed }) {
          const existing = await tx.get(`message/${id}`);
          if (!existing) {
            throw new Error(`Message ${id} not found`);
          }
          await tx.set(`message/${id}`, {
            title,
            completed,
          });
        },
        async deleteMessage(tx, id) {
          await tx.del(`message/${id}`);
        },
      },
      pushURL: `https://todo-api-ixpx.onrender.com/api/replicache/push`,
      pullURL: `https://todo-api-ixpx.onrender.com/api/replicache/pull`,
      auth: `Bearer ${token}`,
      logLevel: "debug",
    });
    setR(r);
    return () => {
      void r.close();
    };
  }, []);

  const messages = useSubscribe(
    r,
    async (tx) => {
      const list = await tx.scan({ prefix: "message/" }).entries().toArray();
      list.sort(([, { order: a }], [, { order: b }]) => a - b);
      console.log(list);
      return list;
    },
    { default: [] }
  );

  const contentRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const content = contentRef.current?.value ?? "";
    await r?.mutate.createMessage({
      id: nanoid(),
      title: content,
    });
    if (contentRef.current) {
      contentRef.current.value = "";
    }
  };

  const handleCheckboxChange = useCallback(
    async (id, title, completed) => {
      if (r) {
        await r.mutate.updateMessage({
          id,
          title,
          completed: !completed,
        });
      }
    },
    [r]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (r) {
        await r.mutate.deleteMessage(id);
      }
    },
    [r]
  );

  const handleEdit = useCallback((id, title) => {
    setEditingId(id);
    setEditingContent(title);
  }, []);

  const handleEditChange = useCallback((e) => {
    setEditingContent(e.target.value);
  }, []);

  const handleSaveEdit = useCallback(
    async (id, completed) => {
      if (r) {
        await r.mutate.updateMessage({
          id,
          title: editingContent,
          completed,
        });
        setEditingId(null);
        setEditingContent("");
      }
    },
    [r, editingContent]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingContent("");
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("token");
    navigate("/signin");
  }, [logout, navigate]);

  return (
    <Container>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      <Title>Todo App</Title>

      <Form onSubmit={onSubmit}>
        <Input ref={contentRef} required placeholder="Type a message..." />
        <Button type="submit">Send</Button>
      </Form>
      {messages.map(([k, v]) => {
        const id = k.split("/")[1];
        const isEditing = editingId === id;

        return (
          <MessageItem key={k}>
            {isEditing ? (
              <>
                <Input value={editingContent} onChange={handleEditChange} />
                <ActionButton onClick={() => handleSaveEdit(id, v.completed)}>
                  Submit
                </ActionButton>
                <ActionButton onClick={handleCancelEdit}>Cancel</ActionButton>
              </>
            ) : (
              <>
                <Checkbox
                  type="checkbox"
                  checked={v?.completed}
                  onChange={() =>
                    handleCheckboxChange(id, v.title, v.completed)
                  }
                />
                <MessageText>{v?.title}</MessageText>
                <ActionButton onClick={() => handleEdit(id, v.title)}>
                  Edit
                </ActionButton>
                <ActionButton onClick={() => handleDelete(id)}>
                  Delete
                </ActionButton>
              </>
            )}
          </MessageItem>
        );
      })}
    </Container>
  );
}

export default App;
