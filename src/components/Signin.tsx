import * as React from "react";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const StyledForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  color: #1a73e8;
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #5f6368;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #1557b0;
  }
`;

export function SignInForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    const res = await fetch("https://todo-api-ixpx.onrender.com/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: userName, password: password }),
    });

    const data = await res.json();

    if (data.message === "invalid password") {
      return;
    }

    if (res.ok) {
      navigate("/");
      localStorage.setItem("token", data.token);
    }

    login(data);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Signing in with:", userName, password);
    handleLogin();
  };

  return (
    <FormContainer>
      <StyledForm onSubmit={handleSubmit}>
        <Title>Sign In</Title>
        <InputGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>
        <SubmitButton type="submit">Sign In</SubmitButton>
      </StyledForm>
    </FormContainer>
  );
}
