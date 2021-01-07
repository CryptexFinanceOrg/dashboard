import React, { useState, useContext, useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.scss";
import Container from "react-bootstrap/esm/Container";
import Alert from "react-bootstrap/esm/Alert";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";
import Graph from "./components/Graph";
import Vault from "./components/Vault/Vault";
import Faucet from "./components/Faucet";
import Governance from "./components/Governance";
import { useSigner } from "./hooks/useSigner";
import { useVaults } from "./hooks/useVaults";
import { useTokens } from "./hooks/useTokens";
import { useOracles } from "./hooks/useOracles";
import { useGovernance } from "./hooks/useGovernance";
import signerContext from "./state/SignerContext";
import vaultsContext from "./state/VaultsContext";
import tokensContext from "./state/TokensContext";
import oraclesContext from "./state/OraclesContext";
import governanceContext from "./state/GovernanceContext";
import { Web3ModalContext } from "./state/Web3ModalContext";
import WETHVault from "./contracts/vaults/WETHVaultHandler.json";
import WBTCVault from "./contracts/vaults/BTCVaultHandler.json";
import DAIVault from "./contracts/vaults/DAIVaultHandler.json";
import WETHOracle from "./contracts/vaults/WETHOracle.json";
import WBTCOracle from "./contracts/vaults/BTCOracle.json";
import DAIOracle from "./contracts/vaults/DAIOracle.json";
import TCAPOracle from "./contracts/vaults/TCAPOracle.json";
import WETHToken from "./contracts/vaults/WETH.json";
import WBTCToken from "./contracts/vaults/WBTC.json";
import DAIToken from "./contracts/vaults/DAI.json";
import TCAPToken from "./contracts/vaults/TCAP.json";
import CTXToken from "./contracts/governance/Ctx.json";
import GovernorAlpha from "./contracts/governance/GovernorAlpha.json";
import Timelock from "./contracts/governance/Timelock.json";
import Loading from "./components/Loading";

const clientOracle = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/cryptexglobal/tcap-rinkeby",
  cache: new InMemoryCache(),
});

const App = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setloading] = useState(true);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const [show, setShow] = useState(true);
  const vaults = useVaults();
  const tokens = useTokens();
  const oracles = useOracles();
  const governance = useGovernance();
  const match = useRouteMatch();

  const setContracts = (currentSigner: ethers.Signer) => {
    // Set Vaults
    const currentWETHVault = new ethers.Contract(WETHVault.address, WETHVault.abi, currentSigner);
    vaults.setCurrentWETHVault(currentWETHVault);
    const currentDAIVault = new ethers.Contract(DAIVault.address, DAIVault.abi, currentSigner);
    vaults.setCurrentDAIVault(currentDAIVault);
    const currentWBTCVault = new ethers.Contract(WBTCVault.address, WBTCVault.abi, currentSigner);
    vaults.setCurrentWBTCVault(currentWBTCVault);
    // Set Tokens
    const currentWETHToken = new ethers.Contract(WETHToken.address, WETHToken.abi, currentSigner);
    tokens.setCurrentWETHToken(currentWETHToken);
    const currentDAIToken = new ethers.Contract(DAIToken.address, DAIToken.abi, currentSigner);
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentWBTCToken = new ethers.Contract(WBTCToken.address, WBTCToken.abi, currentSigner);
    tokens.setCurrentWBTCToken(currentWBTCToken);
    const currentTCAPToken = new ethers.Contract(TCAPToken.address, TCAPToken.abi, currentSigner);
    tokens.setCurrentTCAPToken(currentTCAPToken);
    // Set Oracles
    const currentWETHOracle = new ethers.Contract(
      WETHOracle.address,
      WETHOracle.abi,
      currentSigner
    );
    oracles.setCurrentWETHOracle(currentWETHOracle);
    const currentDAIOracle = new ethers.Contract(DAIOracle.address, DAIOracle.abi, currentSigner);
    oracles.setCurrentDAIOracle(currentDAIOracle);
    const currentWBTCOracle = new ethers.Contract(
      WBTCOracle.address,
      WBTCOracle.abi,
      currentSigner
    );
    oracles.setCurrentWBTCOracle(currentWBTCOracle);
    const currentTCAPOracle = new ethers.Contract(
      TCAPOracle.address,
      TCAPOracle.abi,
      currentSigner
    );
    oracles.setCurrentTCAPOracle(currentTCAPOracle);

    // Set Governance
    const currentCtx = new ethers.Contract(CTXToken.address, CTXToken.abi, currentSigner);
    governance.setCurrentCtxToken(currentCtx);
    const currentGovernorAlpha = new ethers.Contract(
      GovernorAlpha.address,
      GovernorAlpha.abi,
      currentSigner
    );
    governance.setCurrentGovernorAlpha(currentGovernorAlpha);
    const currentTimelock = new ethers.Contract(Timelock.address, Timelock.abi, currentSigner);
    governance.setCurrentTimelock(currentTimelock);
  };

  web3Modal.on("connect", async (networkProvider) => {
    setloading(true);
    const currentProvider = new ethers.providers.Web3Provider(networkProvider);
    const network = await currentProvider.getNetwork();
    if (
      process.env.REACT_APP_NETWORK_ID &&
      !(
        network.chainId === parseInt(process.env.REACT_APP_NETWORK_ID) ||
        parseInt(process.env.REACT_APP_NETWORK_ID) === 0
      )
    ) {
      setInvalidNetwork(true);
    }
    const currentSigner = currentProvider.getSigner();
    signer.setCurrentSigner(currentSigner);
    setContracts(currentSigner);
    setloading(false);
  });

  useEffect(() => {
    const savedAlert = localStorage.getItem("alert");
    if (savedAlert) setShow(false);

    async function loadProvider() {
      if (web3Modal.cachedProvider && !signer.signer) {
        const networkProvider = await web3Modal.connect();
        const currentProvider = new ethers.providers.Web3Provider(networkProvider);
        const network = await currentProvider.getNetwork();

        if (
          process.env.REACT_APP_NETWORK_ID &&
          !(
            network.chainId === parseInt(process.env.REACT_APP_NETWORK_ID) ||
            parseInt(process.env.REACT_APP_NETWORK_ID) === 0
          )
        ) {
          setInvalidNetwork(true);
        }
        const currentSigner = currentProvider.getSigner();
        signer.setCurrentSigner(currentSigner);
        setContracts(currentSigner);
      } else {
        // TODO: get network from env
        const network = "rinkeby";
        const provider = ethers.getDefaultProvider(network, {
          infura: process.env.REACT_APP_INFURA_ID,
          alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        });
        const randomSigner = ethers.Wallet.createRandom().connect(provider);
        setContracts(randomSigner);
      }
      setloading(false);
    }
    // Execute the created function directly
    loadProvider();
    // eslint-disable-next-line
  }, [web3Modal]);

  if (isLoading) {
    return (
      <>
        <Sidebar />
        <Container fluid className="wrapper">
          <Loading title="Loading" message="Please wait" position="total" />
        </Container>
      </>
    );
  }

  if (invalidNetwork) {
    return (
      <>
        <Sidebar />
        <Container fluid className="wrapper">
          <Loading
            title="Invalid Network"
            message="Please switch to Rinkeby network"
            position="total"
          />
        </Container>
      </>
    );
  }

  return (
    <signerContext.Provider value={signer}>
      <tokensContext.Provider value={tokens}>
        <oraclesContext.Provider value={oracles}>
          <vaultsContext.Provider value={vaults}>
            <governanceContext.Provider value={governance}>
              <Sidebar />
              <Container fluid className="wrapper">
                {show && (
                  <Alert
                    variant="rinkeby"
                    onClose={() => {
                      setShow(false);
                      localStorage.setItem("alert", "false");
                    }}
                    dismissible
                  >
                    <b>
                      💀 Oracles and Data reflect Rinkeby Testnet prices, don't send Mainnet tokens
                      or ETH
                    </b>
                  </Alert>
                )}
                <Header />
                <ToastContainer />
                <Switch>
                  <ApolloProvider client={clientOracle}>
                    <Route path={`${match.url}/`}>
                      <Welcome />
                    </Route>
                    <Route path={`${match.url}graph`}>
                      <Graph />
                    </Route>
                    <Route path={`${match.url}vault`}>
                      <Vault />
                    </Route>
                    <Route path={`${match.url}governance`}>
                      <Governance />
                    </Route>
                    <Route path={`${match.url}faucet`}>
                      <Faucet />
                    </Route>
                  </ApolloProvider>
                </Switch>
              </Container>
            </governanceContext.Provider>
          </vaultsContext.Provider>
        </oraclesContext.Provider>
      </tokensContext.Provider>
    </signerContext.Provider>
  );
};

export default App;
