import { useState, useEffect } from "react"
import { OverlayTrigger, Form, Popover } from "react-bootstrap";

const SectionCondtion = ({ children, removeChild, id, changeSectionsIds, idSecEx }) => {
    const [show, setShow] = useState(false);
    const [idSec, setIdSec] = useState(idSecEx);
    const popover = (
        <Popover>
            <Popover.Header>
                <small>ID de la section </small>
            </Popover.Header>
            <Popover.Body>
                <label>id section :</label>
                <Form.Control
                    onChange={(e) => {
                        setIdSec(e.target.value)
                        changeSectionsIds(id, e.target.value);
                    }}
                    value={idSec}
                    size="sm"
                    placeholder="veuillez saisire un ID de cette section" />
            </Popover.Body>
        </Popover>
    );
    useEffect(() => {
        const handleBodyClick = (event) => {
            const popoverElment = document.querySelector(".popover");
            if (
                popoverElment &&
                !popoverElment.contains(event.target)
            ) {
                setShow(false);
            }
        };
        document.body.addEventListener("click", handleBodyClick);

        return () => {
            document.body.removeEventListener("click", handleBodyClick);
        };
    }, []);


    return <>
        <div className="section-condtion">
            {!children || children.length === 0 ? (
                <p>Veuillez glisser un élément au-dessus de cette section </p>
            ) : (
                children.map((child) => (
                    <div
                        key={child.id}
                        id={`child-${child.id}`}
                        className={`child-type-${child.type}`}
                    >
                        <div
                            className="d-flex justify-content-end btn-remove-child"
                            onClick={(e) => removeChild(id, child.id)}
                        >
                            <span className="btn-remove-divider-children">
                                <i className="fas fa-times"></i>
                            </span>
                        </div>
                        <div className={`child-type-${child.type}`}>
                            {child.component}
                        </div>
                    </div>
                ))
            )}
            <OverlayTrigger
                trigger="click"
                placement="left"
                overlay={popover}
                rootClose
            >
                <button className="btn-condtion">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </OverlayTrigger>

        </div>
    </>
}


export default SectionCondtion