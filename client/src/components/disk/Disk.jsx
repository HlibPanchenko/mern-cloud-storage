import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFiles, createDir, uploadFile } from "../../actions/file";
import FileList from "./fileList/FileList";
import "./disk.scss";
import Popup from "./Popup";
import { setPopupDisplay, setCurrentDir } from "../../reducers/fileReducer";
import Uploader from "./uploader/Uploader";

const Disk = () => {
  const dispatch = useDispatch();
  const currentDir = useSelector((state) => state.files.currentDir);
  const loader = useSelector(state => state.app.loader)
  // Каждый раз, когда мы открываем папку, мы будем закидывать ее id
  // в массив dirStack. Таким образом у нас будет путь папок.
  const dirStack = useSelector((state) => state.files.dirStack);
  // отображает перетянуты ли уже какие-то файлы
  const [dragEnter, setDragEnter] = useState(false);
  const [sort, setSort] = useState('type')

  useEffect(() => {
    dispatch(getFiles(currentDir, sort));
  }, [currentDir, sort]);

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
    const files = [...event.target.files];
    // для каждого из этих файлов вызовем функцию загрузки
    files.forEach((file) => dispatch(uploadFile(file, currentDir)));
  }

  // определяет занесли ли мы файл в область
  function dragEnterHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragEnter(true);
  }
  // определяет вышли ли мы из этой области
  function dragLeaveHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragEnter(false);
  }

  // загрузка файлов
  function dropHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    let files = [...event.dataTransfer.files];
    // отправим файлы на сервер
    files.forEach((file) => dispatch(uploadFile(file, currentDir)));
    setDragEnter(false);
  }

  if(loader) {
    return (
        <div className="loader">
            <div className="lds-dual-ring"></div>
        </div>
    )
}

  return !dragEnter ? (
    <div
      className="disk"
      onDragEnter={dragEnterHandler}
      onDragLeave={dragLeaveHandler}
      onDragOver={dragEnterHandler}
    >
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="disk__select"
        >
          <option value="name">По имени</option>
          <option value="type">По типу</option>
          <option value="date">По дате</option>
        </select>
      </div>
      <FileList />
      <Popup />
      <Uploader />
    </div>
  ) : (
    <div
      className="drop-area"
      onDrop={dropHandler}
      onDragEnter={dragEnterHandler}
      onDragLeave={dragLeaveHandler}
      onDragOver={dragEnterHandler}
    >
      Перетащите файлы сюда
    </div>
  );
};

export default Disk;
