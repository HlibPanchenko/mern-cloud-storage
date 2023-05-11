import React from "react";
import "./file.scss";
import dirLogo from "../../../../assets/img/dir.svg";
import fileLogo from "../../../../assets/img/file.svg";
import { useDispatch, useSelector } from "react-redux";
import { pushToStack, setCurrentDir } from "../../../../reducers/fileReducer";

const File = ({ file }) => {
  const dispatch = useDispatch();
  // получим id текущей папки
  const currentDir = useSelector((state) => state.files.currentDir);

  function openDirHandler() {
    if (file.type === "dir") {
      // Каждый раз, когда мы открываем папку, мы будем закидывать
      // ее id в массив dirStack. Таким образом у нас будет путь папок.
      dispatch(pushToStack(currentDir));
      // изменяем текущую директорию
      // передаем id того файла, на который нажимаем
      dispatch(setCurrentDir(file._id));
    }
  }

  return (
    // функия открытия папки будет работать только если нажали на папку
    <div className="file" onClick={() => openDirHandler()}>
      <img
        src={file.type === "dir" ? dirLogo : fileLogo}
        alt=""
        className="file__img"
      />
      <div className="file__name">{file.name}</div>
      <div className="file__date">{file.date.substring(0, 10)}</div>
      <div className="file__size">{file.size}</div>
    </div>
  );
};

export default File;
