// функцию получения файлов с сервера
import axios from 'axios'
import {setFiles} from "../reducers/fileReducer";

// передаем id текущей директории
export function getFiles(dirId) {
// вернем ассинхронную функцию, которая принимает dispatch
    return async dispatch => {
        try {
            const response = await axios.get(`http://localhost:5000/api/files${dirId ? '?parent='+dirId : ''}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
					 // по токену будем идентифицировать пользователя на сервере
            })
            dispatch(setFiles(response.data))
        } catch (e) {
            alert(e.response.data.message)
        }
    }
}