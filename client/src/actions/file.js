// функцию получения файлов с сервера
import axios from "axios";
import { setFiles, addFile, deleteFileAction } from "../reducers/fileReducer";
import {
  addUploadFile,
  changeUploadFile,
  showUploader,
} from "../reducers/uploadReducer";

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

// функция для загрузки файла
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
      // логика Uploader
      const uploadFile = { name: file.name, progress: 0, id: Date.now() };
      dispatch(showUploader());
      dispatch(addUploadFile(uploadFile));
      // объект formData передаем вторым параметром в post запрос
      const response = await axios.post(
        `http://localhost:5000/api/files/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          // проценты загрузки файла
          onUploadProgress: (progressEvent) => {
            // const totalLength = progressEvent.lengthComputable
            //   ? progressEvent.total
            //   : progressEvent.target?.getResponseHeader("content-length") ||
            //     progressEvent.target?.getResponseHeader(
            //       "x-decompressed-content-length"
            //     );
            const totalLength = progressEvent.lengthComputable
              ? progressEvent.total
              : progressEvent.target.getResponseHeader("content-length") ||
                progressEvent.target.getResponseHeader(
                  "x-decompressed-content-length"
                );
            console.log("total", totalLength);
            if (totalLength) {
              // логика Uploader
              uploadFile.progress = Math.round(
                (progressEvent.loaded * 100) / totalLength
              );
              dispatch(changeUploadFile(uploadFile));
              // let progress = Math.round(
              //   (progressEvent.loaded * 100) / totalLength
              // );
              // console.log(progress);
            }
          },
        }
      );
      // диспатчим в редакс
      dispatch(addFile(response.data));
    } catch (e) {
      alert(e?.response?.data?.message);
    }
  };
}

// функцию для скачивания файла
export async function downloadFile(file) {
  const response = await fetch(
    `http://localhost:5000/api/files/download?id=${file._id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (response.status === 200) {
    // blob это подобный физическому файлу объект
    const blob = await response.blob();
    // из этого blob создадим url
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    // имитируем нажатие пользователя на эту ссылку
    link.click();
    link.remove();
  }
}

// функцию для удаления файлов.
export function deleteFile(file) {
  return async (dispatch) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/files?id=${file._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // deleteFileAction - наша функция с редюсера
      dispatch(deleteFileAction(file._id));
      alert(response.data.message);
    } catch (e) {
      alert(e?.response?.data?.message);
    }
  };
}
