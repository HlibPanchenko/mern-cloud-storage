// функцию получения файлов с сервера
import axios from "axios";
import { setFiles, addFile } from "../reducers/fileReducer";

// передаем id текущей директории
export function getFiles(dirId) {
  // вернем ассинхронную функцию, которая принимает dispatch
  return async (dispatch) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/files${dirId ? "?parent=" + dirId : ""}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          // по токену будем идентифицировать пользователя на сервере
        }
      );
      dispatch(setFiles(response.data));
    } catch (e) {
      alert(e.response.data.message);
    }
  };
}

export function createDir(dirId, name) {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/files`,
        {
          name,
          parent: dirId, // id родительской папки
          type: "dir",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(addFile(response.data));
    } catch (e) {
      alert(e.response.data.message);
    }
  };
}

export function uploadFile(file, dirId) {
  return async (dispatch) => {
    try {
      // тело запроса
      const formData = new FormData();
      formData.append("file", file);
      // если id текущей директории существует, тогда в FormData мы помещаем еще и его
      if (dirId) {
        formData.append("parent", dirId);
      }
      // объект formData передаем вторым параметром в post запрос
      const response = await axios.post(
        `http://localhost:5000/api/files/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          // проценты загрузки файла
          onUploadProgress: (progressEvent) => {
            const totalLength = progressEvent.lengthComputable
              ? progressEvent.total
              : progressEvent.target?.getResponseHeader("content-length") ||
                progressEvent.target?.getResponseHeader(
                  "x-decompressed-content-length"
                );
            // const totalLength = progressEvent.lengthComputable
            //   ? progressEvent.total
            //   : progressEvent.target.getResponseHeader("content-length") ||
            //     progressEvent.target.getResponseHeader(
            //       "x-decompressed-content-length"
            //     );
            console.log("total", totalLength);
            if (totalLength) {
              let progress = Math.round(
                (progressEvent.loaded * 100) / totalLength
              );
              console.log(progress);
            }
          },
        }
      );
      // диспатчим в редакс
      dispatch(addFile(response.data));
    } catch (e) {
      alert(e.response.data.message);
    }
  };
}
