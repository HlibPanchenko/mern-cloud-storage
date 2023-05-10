import React from "react";
import Navbar from "./navbar/Navbar";
import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Registration from "./authorization/Registration";
import Login from "./authorization/Login";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../actions/user";

function App() {
  const isAuth = useSelector((state) => state.user.isAuth);
  const dispatch = useDispatch();

  React.useEffect(() => {
// каждый раз когда открываем приложение в браузере, будем получать данные о пользователе
// по токену будем получать пользователя и возвращать его
    dispatch(auth());
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <div className="wrap">
          {!isAuth && (
            <Routes>
              <Route path="/registration" element={<Registration />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
