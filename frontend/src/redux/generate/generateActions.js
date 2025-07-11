import {
    GENERATE_IMAGE_FAIL, GENERATE_IMAGE_REQUEST, GENERATE_IMAGE_RESET, GENERATE_IMAGE_SUCCESS,
    GENERATE_EXCEL_FAIL, GENERATE_EXCEL_REQUEST, GENERATE_EXCEL_RESET, GENERATE_EXCEL_SUCCESS
} from "./generateTypes";
import axios from "axios";


export const generateImage = (html) => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: GENERATE_IMAGE_REQUEST });
            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.post("/api/generate/image", { html }, config);
            console.log(data);
            dispatch({ type: GENERATE_IMAGE_SUCCESS, payload: data });
        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: GENERATE_IMAGE_FAIL, payload: err });
        }
    };
};

export const resetFetchDirections = () => {
    return { type: GENERATE_IMAGE_RESET };
};

export const generateExcel = (filters) => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: GENERATE_EXCEL_REQUEST });
            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
                responseType: 'blob' // Important for file download
            };
            
            const { data } = await axios.post("/api/generate/excel", { filters }, config);
            
            // Create blob and download
            const blob = new Blob([data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `demandes_filtered_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            dispatch({ type: GENERATE_EXCEL_SUCCESS, payload: { message: "Excel généré avec succès" } });
        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: GENERATE_EXCEL_FAIL, payload: err });
        }
    };
};

export const resetGenerateExcel = () => {
    return { type: GENERATE_EXCEL_RESET };
};

