import React, { useEffect, useState } from "react";
import { Nav, Navbar } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useDispatch, useSelector } from "react-redux";
import { hideSidebar } from "../redux/sidebar/sidebarActions";
import { LinkContainer } from "react-router-bootstrap";
import _nav from "../routes/_nav.js";

const SideBar = () => {
  const [links, setLinks] = useState([]);
  const [callOnce, setCallOnce] = useState(false);
  const dispatch = useDispatch();

  const sidebar = useSelector((state) => state.sidebar);
  const userLogin = useSelector((state) => state.userLogin);

  const { show } = sidebar;
  const {
    userInfo: { roles },
  } = userLogin;

  useEffect(() => {
    if (!callOnce) {
      if (links.length === 0) {
        const roleCodes = roles.map((role) => role.role.code);
        const filteredNav = _nav.filter((item) => {
          return item.roles.some((roleCode) => roleCodes.includes(roleCode));
        });
        setLinks(filteredNav);
      }
      setCallOnce(true);
    }
    const handleResize = () => {
      if (window.innerWidth >= 991) {
        dispatch(hideSidebar());
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch, roles, links, callOnce]);
  return (
    <>
      <Offcanvas
        show={show}
        onHide={() => dispatch(hideSidebar())}
        style={{ zIndex: "9998 !important" }}
      >
        <div className="bg-dark h-100 py-2 px-3">
          <div className="d-flex justify-content-center align-items-center">
            <img
              src="/images/logo.png"
              className="sidebar-logo d-block"
              alt="sidebar-logo"
            />
            <h6 className="text-white d-block m-1 mt-2">e-dami</h6>
          </div>
          <hr />
          <Navbar variant="dark">
            <Nav
              defaultActiveKey="/"
              className="flex-column text-white"
              variant="light"
              bg="dark"
            >
              {links.map((link) => (
                <LinkContainer key={link.name} to={link.to}>
                  <Nav.Link>
                    {link.icon} {link.name}
                  </Nav.Link>
                </LinkContainer>
              ))}
            </Nav>
          </Navbar>
        </div>
      </Offcanvas>

      <div className="bg-dark text-white py-3 px-2 d-none  d-lg-block side-bar">
        <div className="d-flex justify-content-center align-items-center">
          <img
            src="/images/logo.png"
            className="sidebar-logo d-block"
            alt="sidebar-logo"
          />
          <h6 className="text-white d-block m-1 mt-2">e-dami</h6>
        </div>
        <hr />
        <Navbar variant="dark">
          <Nav className="flex-column" variant="light" bg="dark">
            {links.map((link) => (
              <LinkContainer key={link.name} to={link.to}>
                <Nav.Link className="ml-0">
                  {link.icon} {link.name}
                </Nav.Link>
              </LinkContainer>
            ))}
          </Nav>


        </Navbar>
      </div>
    </>
  );
};

export default SideBar;
