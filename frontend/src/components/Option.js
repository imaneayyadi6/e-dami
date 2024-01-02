import React, { useEffect, useRef, useState } from "react";
import Dami from "./Dami";
import html2canvas from 'html2canvas';
import { useDispatch, useSelector } from "react-redux";
import { generateImage } from "../redux/generate/generateActions";

const Option = ({ option }) => {
    const [damiImageSrc, setDamiImageSrc] = useState(null);
    const [callOnce, setCallOnce] = useState(false);

    const dispatch = useDispatch();
    const imageGenerate = useSelector(state => state.imageGenerate);
    const {
        dataImage,
        success,
    } = imageGenerate;

    const damiContainerRef = useRef(null);


    useEffect(() => {
        if (!callOnce) {
            dispatch(generateImage(damiContainerRef.current.innerHTML))
            setCallOnce(true);
        }

        if (success) {
            console.log(dataImage)
        }
    }, [success, callOnce])


    return (
        <div className="h-100 " ref={damiContainerRef}        >
           
            {dataImage ? (
                <div
                    dangerouslySetInnerHTML={{
                        __html: dataImage,
                    }}
                >
                </div>
            )
        :
        (
            <Dami option={option} />
        )
        }
        </div>
    )
}

export default Option;
