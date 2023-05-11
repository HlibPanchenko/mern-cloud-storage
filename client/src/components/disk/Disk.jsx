import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFiles, createDir } from "../../actions/file";
import FileList from "./fileList/FileList";
import "./disk.scss";
import Popup from "./Popup";
import {setPopupDisplay, setCurrentDir} from "../../reducers/fileReducer";

const Disk = () => {
  const dispatch = useDispatch();
  const currentDir = useSelector((state) => state.files.currentDir);
  // Каждый раз, когда мы открываем папку, мы будем закидывать ее id 
  // в массив dirStack. Таким образом у нас будет путь папок.
  const dirStack = useSelector(state => state.files.dirStack)

  useEffect(() => {
    dispatch(getFiles(currentDir));
  }, [currentDir]);

  // функция открытия модального окна 
  function showPopupHandler() {
	dispatch(setPopupDisplay('flex'))
}

// возвращение назад (в прошлую папку)
function backClickHandler() {
	// получаем ID последней открытой папки 
	const backDirId = dirStack.pop()
	// делаем эту папку текущей 
	dispatch(setCurrentDir(backDirId))
}

  return (
    <div className="disk">
      <div className="disk__btns">
        <button className="disk__back" onClick={() => backClickHandler()}>Назад</button>
        <button className="disk__create" onClick={() => showPopupHandler()}>Создать папку</button>
      </div>
      <FileList />
		<Popup/>
    </div>
  );
};

export default Disk;
