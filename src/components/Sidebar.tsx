import React, { useContext, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import "../styles/sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { ReactComponent as Logo } from "../assets/images/favicon.svg";
import { ReactComponent as DashboardIcon } from "../assets/images/welcome/dashboard.svg";
import { ReactComponent as VaultIcon } from "../assets/images/welcome/vault.svg";
import { ReactComponent as FaucetIcon } from "../assets/images/welcome/faucet.svg";
import { ReactComponent as LogoutIcon } from "../assets/images/welcome/logout.svg";
import { ReactComponent as GraphIcon } from "../assets/images/welcome/graph.svg";

const Sidebar = () => {
  const location = useLocation();
  let activeVal = "dashboard";
  switch (location.pathname) {
    case "/":
      activeVal = "dashboard";
      break;
    case "/vault":
      activeVal = "vault";
      break;
    case "/graph":
      activeVal = "graph";
      break;
    case "/faucet":
      activeVal = "faucet";
      break;
    default:
      activeVal = "dashboard";
      break;
  }
  const [active, setActive] = useState(activeVal);
  const web3Modal = useContext(Web3ModalContext);

  return (
    <Nav className="sidebar">
      <Nav.Item className="mt-4 mb-1">
        <Logo />
      </Nav.Item>
      <Nav.Item>
        {active === "dashboard" ? (
          <Link
            to="/"
            className="active"
            onClick={() => {
              setActive("dashboard");
            }}
          >
            <DashboardIcon />
          </Link>
        ) : (
          <Link
            to="/"
            onClick={() => {
              setActive("dashboard");
            }}
          >
            <DashboardIcon />
          </Link>
        )}
      </Nav.Item>
      <Nav.Item>
        {active === "graph" ? (
          <Link
            to="/graph"
            className="active"
            onClick={() => {
              setActive("graph");
            }}
          >
            <GraphIcon />
          </Link>
        ) : (
          <Link
            to="/graph"
            onClick={() => {
              setActive("graph");
            }}
          >
            <GraphIcon />
          </Link>
        )}
      </Nav.Item>
      <Nav.Item>
        {active === "vault" ? (
          <Link
            to="/vault"
            className="active"
            onClick={() => {
              setActive("vault");
            }}
          >
            <VaultIcon />
          </Link>
        ) : (
          <Link
            to="/vault"
            onClick={() => {
              setActive("vault");
            }}
          >
            <VaultIcon />
          </Link>
        )}
      </Nav.Item>
      <Nav.Item>
        {active === "faucet" ? (
          <Link
            to="/faucet"
            className="active"
            onClick={() => {
              setActive("faucet");
            }}
          >
            <FaucetIcon />
          </Link>
        ) : (
          <Link
            to="/faucet"
            onClick={() => {
              setActive("faucet");
            }}
          >
            <FaucetIcon />
          </Link>
        )}
      </Nav.Item>
      <Nav.Item>
        <Link
          to=""
          onClick={(event) => {
            event.preventDefault();
            web3Modal.clearCachedProvider();
            window.location.reload();
          }}
        >
          <LogoutIcon />
        </Link>
      </Nav.Item>
    </Nav>
  );
};

export default Sidebar;
