import {
    GENERATE_IMAGE_FAIL, GENERATE_IMAGE_REQUEST, GENERATE_IMAGE_RESET, GENERATE_IMAGE_SUCCESS,
    GENERATE_EXCEL_FAIL, GENERATE_EXCEL_REQUEST, GENERATE_EXCEL_RESET, GENERATE_EXCEL_SUCCESS
} from "./generateTypes";

export const imageGenerateReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case GENERATE_IMAGE_REQUEST:
            return { loading: true, }
        case GENERATE_IMAGE_SUCCESS:
            return { dataImage: payload, success: true, }
        case GENERATE_IMAGE_FAIL:
            return { error: payload }
        case GENERATE_IMAGE_RESET:
            return {};
        default:
            return state;
    }
}

export const excelGenerateReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case GENERATE_EXCEL_REQUEST:
            return { loading: true, }
        case GENERATE_EXCEL_SUCCESS:
            return { dataExcel: payload, success: true, }
        case GENERATE_EXCEL_FAIL:
            return { error: payload }
        case GENERATE_EXCEL_RESET:
            return {};
        default:
            return state;
    }
}