import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  fetchOptionByID,
  resetFetchOptionByID,
} from "../../redux/option/optionActions";
import { Dami, DamiLoading, Message, WarningMessage } from "../../components";

const DamiDetailsPageCrtOp = () => {
  const [callOnce, setCallOnce] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const optionByID = useSelector(state => state.optionByID);
  const {
    loading: loadingOptionByID,
    error: errorOptionByID,
    option: recoveredOption,
    success: successOptionByID,
  } = optionByID;

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchOptionByID(id));
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        <Link
          to='/options'
          className='btn btn-sm btn-light mb-3'
          onClick={() => {
            dispatch(resetFetchOptionByID());
          }}>
          <i className='fas fa-arrow-left'></i> retour
        </Link>
      </div>
      {errorOptionByID && <Message type='danger' itWillBeHidden>{errorOptionByID}</Message>}
      <>

        {loadingOptionByID ? (
          <div className="dami-page-container">
            <DamiLoading />
          </div>
        ) : (
          recoveredOption && (<div className="dami-page-container mt-5">

            <Dami option={recoveredOption} showAdmin />
          </div>
          )
        )}
        {!loadingOptionByID && !recoveredOption && (
          <WarningMessage message={"option (DAMI) introuvable !"} />
        )}

      </>
    </>
  );
};

export default DamiDetailsPageCrtOp;
