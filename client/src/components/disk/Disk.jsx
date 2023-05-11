import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFiles, createDir, uploadFile } from "../../actions/file";
import FileList from "./fileList/FileList";
import "./disk.scss";
import Popup from "./Popup";
import { setPopupDisplay, setCurrentDir } from "../../reducers/fileReducer";

const Disk = () => {
  const dispatch = useDispatch();
  const currentDir = useSelector((state) => state.files.currentDir);
  // Каждый раз, когда мы открываем папку, мы будем закидывать ее id
  // в массив dirStack. Таким образом у нас будет путь папок.
  const dirStack = useSelector((state) => state.files.dirStack);

  useEffect(() => {
    dispatch(getFiles(currentDir));
  }, [currentDir]);

  // функция открытия модального окна
  function showPopupHandler() {
    dispatch(setPopupDisplay("flex"));
  }

  // возвращение назад (в прошлую папку)
  function backClickHandler() {
    // получаем ID последней открытой папки
    const backDirId = dirStack.pop();
    // делаем эту папку текущей
    dispatch(setCurrentDir(backDirId));
  }

  // вызывается при выборе файлов в input
  function fileUploadHandler(event) {
  // в массив прокинем список файлов из input
	const files = [...event.target.files]
  // для каждого из этих файлов вызовем функцию загрузки 
	files.forEach(file => dispatch(uploadFile(file, currentDir)))
}

  return (
    <div className="disk">
      <div className="disk__btns">
        <button className="disk__back" onClick={() => backClickHandler()}>
          Назад
        </button>
        <button className="disk__create" onClick={() => showPopupHandler()}>
          Создать папку
        </button>
        <div className="disk__upload">
          <label htmlFor="disk__upload-input" className="disk__upload-label">
            Загрузить файл
          </label>
          <input
            multiple={true} // пользователь может выбрать сразу несколько файлов
            onChange={(event) => fileUploadHandler(event)}
            type="file"
            id="disk__upload-input"
            className="disk__upload-input"
          />
        </div>
      </div>
      <FileList />
      <Popup />
    </div>
  );
};

export default Disk;
