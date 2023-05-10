// будем реализовывать функции запросов
import axios from "axios";

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
