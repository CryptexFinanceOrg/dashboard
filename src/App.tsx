import React, { useState, useContext, useEffect } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.scss";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@react-hook/media-query";
import Container from "react-bootstrap/esm/Container";
import Alert from "react-bootstrap/esm/Alert";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Welcome from "./components/Welcome";
import Graph from "./components/Graph";
import Vault from "./components/Vault/Vault";
import Pool from "./components/Pool";
import Governance from "./components/Governance";
import Loading from "./components/Loading";
import Farm from "./components/Farm";
import { useSigner } from "./hooks/useSigner";
import { useVaults } from "./hooks/useVaults";
import { useTokens } from "./hooks/useTokens";
import { useOracles } from "./hooks/useOracles";
import { useGovernance } from "./hooks/useGovernance";
import { useRewards } from "./hooks/useRewards";
import signerContext from "./state/SignerContext";
import vaultsContext from "./state/VaultsContext";
import tokensContext from "./state/TokensContext";
import oraclesContext from "./state/OraclesContext";
import governanceContext from "./state/GovernanceContext";
import rewardsContext from "./state/RewardsContext";
import { Web3ModalContext } from "./state/Web3ModalContext";
import cryptexJson from "./contracts/cryptex.json";
import ERC20 from "./contracts/ERC20.json";
import WETH from "./contracts/WETH.json";
import UniV2Pair from "./contracts/UniswapV2Pair.json";

const clientOracle = new ApolloClient({
  uri: process.env.REACT_APP_GRAPH_URL,
  cache: new InMemoryCache(),
});

const App = () => {
  const signer = useSigner();
  const web3Modal = useContext(Web3ModalContext);
  const [isLoading, setloading] = useState(true);
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const [show, setShow] = useState(true);
  const [vaultWarning, setVaultWarning] = useState(true);
  const isMobile = useMediaQuery("only screen and (max-width: 600px)");
  const [showSidebar, setShowSidebar] = useState(true);
  const vaults = useVaults();
  const tokens = useTokens();
  const oracles = useOracles();
  const governance = useGovernance();
  const rewards = useRewards();
  const match = useRouteMatch();
  const location = useLocation();

  const setContracts = (currentSigner: ethers.Signer) => {
    const networkId = parseInt(process.env.REACT_APP_NETWORK_ID || "4");
    let contracts;
    switch (networkId) {
      case 1:
        contracts = cryptexJson[1].mainnet.contracts;
        break;
      case 4:
        contracts = cryptexJson[4].rinkeby.contracts;
        break;
      default:
        contracts = cryptexJson[4].rinkeby.contracts;
        break;
    }

    // Set Vaults
    const currentWETHVault = new ethers.Contract(
      contracts.WETHVaultHandler.address,
      contracts.WETHVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentWETHVault(currentWETHVault);
    const currentDAIVault = new ethers.Contract(
      contracts.DAIVaultHandler.address,
      contracts.DAIVaultHandler.abi,
      currentSigner
    );
    vaults.setCurrentDAIVault(currentDAIVault);
    // Set Tokens
    const currentWETHToken = new ethers.Contract(
      process.env.REACT_APP_WETH_ADDRESS || "",
      ERC20.abi,
      currentSigner
    );
    tokens.setCurrentWETHToken(currentWETHToken);
    const currentDAIToken = new ethers.Contract(
      process.env.REACT_APP_DAI_ADDRESS || "",
      WETH.abi,
      currentSigner
    );
    tokens.setCurrentDAIToken(currentDAIToken);
    const currentTCAPToken = new ethers.Contract(
      contracts.TCAP.address,
      contracts.TCAP.abi,
      currentSigner
    );
    tokens.setCurrentTCAPToken(currentTCAPToken);

    // TODO:remove this once other pools work
    if (process.env.REACT_APP_POOL_ETH) {
      const currentWETHPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_ETH,
        UniV2Pair.abi,
        currentSigner
      );

      tokens.setCurrentWETHPoolToken(currentWETHPoolToken);
    }
    if (
      process.env.REACT_APP_POOL_ETH &&
      process.env.REACT_APP_POOL_DAI &&
      process.env.REACT_APP_POOL_CTX
    ) {
      // Set Pool Tokens
      const currentWETHPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_ETH,
        UniV2Pair.abi,
        currentSigner
      );

      tokens.setCurrentWETHPoolToken(currentWETHPoolToken);

      const currentDAIPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_DAI,
        UniV2Pair.abi,
        currentSigner
      );
      tokens.setCurrentDAIPoolToken(currentDAIPoolToken);

      const currentCTXPoolToken = new ethers.Contract(
        process.env.REACT_APP_POOL_CTX,
        UniV2Pair.abi,
        currentSigner
      );
      tokens.setCurrentCTXPoolToken(currentCTXPoolToken);
    }

    // Set Rewards
    const currentWETHReward = new ethers.Contract(
      contracts.WETHRewardHandler.address,
      contracts.WETHRewardHandler.abi,
      currentSigner
    );
    rewards.setCurrentWETHReward(currentWETHReward);

    const currentDAIReward = new ethers.Contract(
      contracts.DAIRewardHandler.address,
      contracts.DAIRewardHandler.abi,
      currentSigner
    );
    rewards.setCurrentDAIReward(currentDAIReward);

    // Set Liquidity Rewards
    const currentWETHPoolReward = new ethers.Contract(
      // @ts-ignore
      contracts.ETHLiquidityReward.address,
      // @ts-ignore
      contracts.ETHLiquidityReward.abi,
      currentSigner
    );
    rewards.setCurrentWETHPoolReward(currentWETHPoolReward);

    // Set Oracles
    const currentWETHOracle = new ethers.Contract(
      contracts.WETHOracle.address,
      contracts.WETHOracle.abi,
      currentSigner
    );
    oracles.setCurrentWETHOracle(currentWETHOracle);
    const currentDAIOracle = new ethers.Contract(
      contracts.DAIOracle.address,
      contracts.DAIOracle.abi,
      currentSigner
    );
    oracles.setCurrentDAIOracle(currentDAIOracle);

    const currentTCAPOracle = new ethers.Contract(
      contracts.TCAPOracle.address,
      contracts.TCAPOracle.abi,
      currentSigner
    );
    oracles.setCurrentTCAPOracle(currentTCAPOracle);

    // Set Governance
    const currentCtx = new ethers.Contract(contracts.Ctx.address, contracts.Ctx.abi, currentSigner);
    governance.setCurrentCtxToken(currentCtx);
    const currentGovernorAlpha = new ethers.Contract(
      contracts.GovernorAlpha.address,
      contracts.GovernorAlpha.abi,
      currentSigner
    );
    governance.setCurrentGovernorAlpha(currentGovernorAlpha);
    const currentTimelock = new ethers.Contract(
      contracts.Timelock.address,
      contracts.Timelock.abi,
      currentSigner
    );
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
        const network = process.env.REACT_APP_NETWORK_NAME;
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

  const handlers = useSwipeable({
    onSwipedLeft: () => setShowSidebar(true),
    onSwipedRight: () => setShowSidebar(false),
    delta: 40,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (isLoading) {
    return (
      <>
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} isMobile={isMobile} />
        <Container fluid className="wrapper">
          <Loading title="Loading" message="Please wait" position="total" />
        </Container>
      </>
    );
  }

  if (invalidNetwork) {
    const networkName = process.env.REACT_APP_NETWORK_NAME;
    return (
      <>
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} isMobile={isMobile} />
        <Container fluid className="wrapper">
          <Loading
            title="Invalid Network"
            message={`Please switch to ${networkName} network`}
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
              <rewardsContext.Provider value={rewards}>
                <Sidebar
                  showSidebar={showSidebar}
                  setShowSidebar={setShowSidebar}
                  isMobile={isMobile}
                />
                <Topbar
                  showSidebar={showSidebar}
                  setShowSidebar={setShowSidebar}
                  isMobile={isMobile}
                />
                <Container fluid className="wrapper" {...handlers}>
                  {show && (
                    <Alert
                      onClose={() => {
                        setShow(false);
                        localStorage.setItem("alert", "false");
                      }}
                      dismissible
                    >
                      <b>💀 This project is on beta. Use at your own risk.</b>
                    </Alert>
                  )}
                  {vaultWarning && location.pathname === "/vault" && (
                    <Alert
                      onClose={() => {
                        setVaultWarning(false);
                        localStorage.setItem("alert", "false");
                      }}
                      dismissible
                    >
                      <b>
                        ⚠️ Make sure to always have a ratio above the minimun ratio to avoid getting
                        liquidated.
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
                      <Route path={`${match.url}farm`}>
                        <Farm />
                      </Route>
                      <Route path={`${match.url}governance`}>
                        <Governance />
                      </Route>
                      <Route path={`${match.url}pools`}>
                        <Pool />
                      </Route>
                    </ApolloProvider>
                  </Switch>
                </Container>
              </rewardsContext.Provider>
            </governanceContext.Provider>
          </vaultsContext.Provider>
        </oraclesContext.Provider>
      </tokensContext.Provider>
    </signerContext.Provider>
  );
};

export default App;
