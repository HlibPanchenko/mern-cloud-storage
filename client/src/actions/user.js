// будем реализовывать функции запросов
import axios from "axios";
import { setUser } from "../reducers/userReducer";
import { API_URL } from "../config";

export const registration = async (email, password) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/auth/registration`,
      // тело запроса
      {
        email,
        password,
      }
    );
    alert(response.data.message);
  } catch (e) {
    // соощение с ошибкой полученное от сервера
    alert(e.response.data.message);
  }
};

// отправка запроса login на сервер
export const login = (email, password) => {
  // будем сохранять данные о пользователе в состояние
  return async (dispatch) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/login`,
        {
          email,
          password,
        }
      );
      // сохраним пользователя в состояние
      dispatch(setUser(response.data.user));
      // токен храним в LS
      localStorage.setItem("token", response.data.token);
    } catch (e) {
      alert(e.response.data.message);
    }
  };
};

//
export const auth = () => {
  return async (dispatch) => {
    try {
      // в заголовки запроса добавим токен Authorization: Bearer...
      const response = await axios.get(`http://localhost:5000/api/auth/auth`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", response.data.token);
    } catch (e) {
      alert(e.response.data.message);
      localStorage.removeItem("token");
    }
  };
};
// Функция принимает файл – аватарку.
export const uploadAvatar = (file) => {
  return async (dispatch) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${API_URL}api/files/avatar`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(setUser(response.data));
    } catch (e) {
      console.log(e);
    }
  };
};

export const deleteAvatar = () => {
  return async (dispatch) => {
    try {
      const response = await axios.delete(`${API_URL}api/files/avatar`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      dispatch(setUser(response.data));
    } catch (e) {
      console.log(e);
    }
  };
};
