import {
    GENERATE_IMAGE_FAIL, GENERATE_IMAGE_REQUEST, GENERATE_IMAGE_RESET, GENERATE_IMAGE_SUCCESS
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

