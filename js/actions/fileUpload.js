import {
    FILE_UPLOAD_START,
    FILE_UPLOAD_SUCCESS ,
    FILE_UPLOAD_PROGRESS ,
    FILE_UPLOAD_ERROR,
    FILE_UPLOAD_RESET
} from '../constants/ActionTypes'

import { DeviceEventEmitter } from 'react-native'
import { uploadToCloudinary } from './api'

const UPLOADING_MSG = 'Post is uploading, please don\'t close the app';
const UPLOADED_MSG = 'Post successfully uploaded';
const UPLOAD_FAILED_MSG = 'Post failed to upload';


export function cloudinaryUpload(type, path, callback){
    return (dispatch) => {
        let uploadListener = DeviceEventEmitter.addListener('RNUploaderProgress', (data)=>{
            //let bytesWritten = data.totalBytesWritten;
            //let bytesTotal   = data.totalBytesExpectedToWrite;
            let progress     = data.progress;
            dispatch(fileUploadProgress(progress));
            console.log( "upload progress: " + progress + "%");
        });


        dispatch(fileUploadStart())
        uploadToCloudinary(type, path, function(err, res){
            if (err || res.status != 200) {
                console.log('cloudinary error', err)
                dispatch(fileUploadError(err))
            } else {
                dispatch(fileUploadSuccess(res))
            }
            uploadListener.remove();
            callback(err, res);
        });
    }
}

export function fileUploadReset() {
    return {
        type: FILE_UPLOAD_RESET,
        payload: {
            error: null,
            inProgress: false,
            progress: 0,
            message: '',
            success: false
        }
    }
}

function fileUploadStart() {
    return {
        type: FILE_UPLOAD_START,
        payload: {
            error: null,
            inProgress: true,
            progress: 0,
            message: UPLOADING_MSG,
            success: false
        }
    }
}

function fileUploadSuccess(data) {
    return {
        type: FILE_UPLOAD_SUCCESS,
        payload: {
            error: null,
            inProgress: false,
            progress: 0,
            message: UPLOADED_MSG,
            success: true
        }
    }
}

function fileUploadError(error) {
    return {
        type: FILE_UPLOAD_ERROR,
        payload: {
            error,
            inProgress: false,
            progress: 0,
            message: UPLOAD_FAILED_MSG,
            success: false
        }
    }
}

function fileUploadProgress(progress) {
    return {
        type: FILE_UPLOAD_PROGRESS,
        payload: {
            inProgress: true,
            progress,
            message:UPLOADING_MSG,
        }
    }
}

