import axios from "axios";

const userInfoFromStorage = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

// export const getToastNotificationsList = async () => {
//     try {
//         const config = {
//             headers: {
//                 "Content-Type": "application/json",
//                 authorization: `Bearer ${userInfoFromStorage.token}`,
//             },
//         };

//         const { data } = await axios.get("/api/notifications/toast", config);
//         return data;
//     } catch (error) {
//         const err =
//             error.response && error.response.data.message
//                 ? error.response.data.message
//                 : error.message;
//         return err;
//     }
// }