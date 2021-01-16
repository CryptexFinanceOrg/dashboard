import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import Table from "react-bootstrap/esm/Table";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import ethers from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import SignerContext from "../state/SignerContext";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import GovernanceContext from "../state/GovernanceContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { makeShortAddress } from "../utils/utils";
import "../styles/governance.scss";
import { ReactComponent as CtxIcon } from "../assets/images/ctx-coin.svg";
import Loading from "./Loading";
import { NewProposal } from "./modals/NewProposal";
import { Delegate } from "./modals/Delegate";
import { Vote } from "./modals/Vote";

const Governance = () => {
  const [address, setAddress] = useState("");
  const [ctxBalance, setCtxBalance] = useState("0");
  const [currentVotes, setCurrentVotes] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const signer = useContext(SignerContext);
  const web3Modal = useContext(Web3ModalContext);
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);
  const governance = useContext(GovernanceContext);
  const [noDelegate, setNoDelegate] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [newProposalShow, setNewProposalShow] = useState(false);
  const [delegateShow, setDelegateShow] = useState(false);
  const [proposerThreshold, setProposerThreshold] = useState("0");
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  // Vote Modal
  const [voteShow, setVoteShow] = useState(false);
  const [voteProposal, setVoteProposal] = useState<any>();
  const [voteFor, setVoteFor] = useState(0);
  const [voteAgainst, setVoteAgainst] = useState(0);
  const [voteEndTime, setVoteEndTime] = useState("");

  function clickVote(proposal: any, forVote: number, against: number, endTime: string) {
    setVoteProposal(proposal);
    setVoteFor(forVote);
    setVoteAgainst(against);
    setVoteEndTime(endTime);
    setVoteShow(true);
  }

  const PROPOSALS = gql`
    query {
      proposals(orderBy: id, orderDirection: desc) {
        id
        proposer {
          id
        }
        targets
        values
        signatures
        calldatas
        status
        description
        startBlock
        endBlock

        votes {
          id
          support
          votes
        }
      }
    }
  `;

  const { data } = useQuery(PROPOSALS);

  const refresh = async () => {
    try {
      if (signer.signer && tokens.tcapToken && oracles.tcapOracle && governance.ctxToken) {
        const currentAddress = await signer.signer.getAddress();
        const delegateAddress = await governance.ctxToken.delegates(currentAddress);
        if (delegateAddress === ethers.constants.AddressZero) {
          setNoDelegate(true);
        } else {
          setNoDelegate(false);
        }
        setAddress(makeShortAddress(delegateAddress));
        const currentCtxBalance = await governance.ctxToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(tcapString);
        const votes = await governance.ctxToken.getCurrentVotes(currentAddress);
        setCurrentVotes(votes.toString());
      }
    } catch (error) {
      // catch error in case the vault screen is changed
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      if (
        signer.signer &&
        tokens.tcapToken &&
        oracles.tcapOracle &&
        governance.ctxToken &&
        governance.governorAlpha
      ) {
        const currentAddress = await signer.signer.getAddress();
        const delegateAddress = await governance.ctxToken.delegates(currentAddress);
        if (delegateAddress === ethers.constants.AddressZero) {
          setNoDelegate(true);
        } else {
          setNoDelegate(false);
        }
        setAddress(makeShortAddress(delegateAddress));
        const currentCtxBalance = await governance.ctxToken.balanceOf(currentAddress);
        const tcapString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(tcapString);
        const votes = await governance.ctxToken.getCurrentVotes(currentAddress);
        setCurrentVotes(ethers.utils.formatEther(votes));
        const currentThreshold = await governance.governorAlpha.proposalThreshold();
        setProposerThreshold(ethers.utils.formatEther(currentThreshold));
      }
      if (data) {
        const currentProposals: any[] = [];
        await data.proposals.forEach((p: any) => {
          currentProposals.push(p);
        });
        setProposals(currentProposals);
        const network = "rinkeby";
        const provider = ethers.getDefaultProvider(network, {
          infura: process.env.REACT_APP_INFURA_ID,
          alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        });
        const block = await provider.getBlockNumber();
        setCurrentBlock(block);
        const timestamp = Date.now();
        setCurrentTimestamp(timestamp);
        setIsLoading(false);
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [currentVotes, data, isLoading, address]);

  if (isLoading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="governance-dashboard">
      <div>
        <h3>Governance Portal</h3>
        <Row className="data">
          <Col>
            <h2 className="number neon-highlight">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value="10,000,000"
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={0}
              />{" "}
            </h2>
            <p>Total Supply</p>
          </Col>
          <Col>
            <h2 className="number neon-highlight">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value="400,000"
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={0}
              />{" "}
            </h2>
            <p>Quorum Required</p>
          </Col>
          <Col className="token-price">
            <h2 className="number neon-dark-blue">
              <CtxIcon className="ctx-neon" />
              <NumberFormat
                className="number"
                value={proposerThreshold}
                displayType="text"
                thousandSeparator
                decimalScale={0}
              />
            </h2>
            <p>Proposal Threshold</p>
          </Col>
          <Col className="token-price">
            <h2 className="number neon-dark-blue">
              <NumberFormat
                className="number"
                value="3 "
                displayType="text"
                thousandSeparator
                decimalScale={2}
              />{" "}
              days
            </h2>
            <p>Voting Period</p>
          </Col>
        </Row>
        <Row className="card-wrapper">
          <Col xs={12} lg={3}>
            {address !== "" ? (
              <Card className="balance">
                <div className="">
                  <h2>Balance</h2>
                  <p>
                    {noDelegate ? (
                      <></>
                    ) : (
                      <>
                        Delegated Account <b className="">{address}</b>
                      </>
                    )}
                  </p>
                </div>
                <Row className="">
                  <Col>
                    <h3 className="number neon-blue">
                      <CtxIcon className="ctx-neon" />
                      <NumberFormat
                        className="number"
                        value={ctxBalance}
                        displayType="text"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </h3>
                    <p>CTX Balance</p>
                  </Col>
                </Row>
                {currentVotes !== "0" && currentVotes !== "0.0" && (
                  <>
                    <Row className="">
                      <Col>
                        <h3 className="number neon-blue">
                          <CtxIcon className="ctx-neon" />
                          <NumberFormat
                            className="number"
                            value={currentVotes}
                            displayType="text"
                            thousandSeparator
                            decimalScale={2}
                          />
                        </h3>
                        <p>Delegated Votes</p>
                      </Col>
                    </Row>
                  </>
                )}
                <br />
                <Button className="neon-highlight" onClick={() => setDelegateShow(true)}>
                  Delegate
                </Button>
                <br />
                <Button
                  className="neon-green"
                  variant="success"
                  onClick={() => setNewProposalShow(true)}
                >
                  Propose
                </Button>{" "}
                <br />
              </Card>
            ) : (
              <Card className="balance">
                <div className="">
                  <h2>Connect Your Account</h2>
                  <p>Vote and delegate with your CTX tokens connecting your account</p>
                </div>
                <Row className="">
                  <Col>
                    <Button
                      variant="primary"
                      id="connect"
                      className="neon-pink"
                      onClick={() => {
                        web3Modal.toggleModal();
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </Col>
          <Col xs={12} sm={12} lg={9} className="use-tcap">
            <Card className="diamond">
              <h2>Proposals</h2>
              <p>User your CTX to vote for TCAP</p>
              <Row className="">
                <Table hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Proposer</th>
                      <th>Votes</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal, i) => {
                      let forVotes = 0;
                      let againstVotes = 0;
                      proposal.votes.map((vote: any) => {
                        if (vote.support) {
                          forVotes += parseInt(vote.votes);
                        } else {
                          againstVotes += parseInt(vote.votes);
                        }
                        return true;
                      });
                      const denominator = forVotes + againstVotes;
                      const forRate = denominator !== 0 ? (forVotes / denominator) * 100 : 0;
                      const againstRate =
                        denominator !== 0 ? (againstVotes / denominator) * 100 : 0;
                      const animated =
                        proposal.status === "PENDING" || proposal.status === "ACTIVE";
                      const timeBlock = proposal.endBlock - currentBlock;
                      const endTimeMili = currentTimestamp + timeBlock * 13 * 1000;
                      const endTime = new Date(endTimeMili).toDateString();

                      const row = (
                        <tr key={i}>
                          <td>{proposal.id}</td>
                          <td>{proposal.description}</td>
                          <td>
                            <a
                              href={`https://rinkeby.etherscan.io/address/${proposal.proposer.id}`}
                            >
                              {makeShortAddress(proposal.proposer.id)}
                            </a>
                          </td>
                          <td>
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top">
                                  👍: {forVotes.toLocaleString()}
                                  <br /> 👎: {againstVotes.toLocaleString()}
                                </Tooltip>
                              }
                            >
                              <ProgressBar>
                                <ProgressBar
                                  animated={animated}
                                  variant="highlight"
                                  now={forRate}
                                  key={1}
                                />
                                <ProgressBar
                                  animated={animated}
                                  variant="warning"
                                  now={againstRate}
                                  key={2}
                                />
                              </ProgressBar>
                            </OverlayTrigger>
                          </td>
                          <td>
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={<Tooltip id="tooltip-top">Closes on {endTime}</Tooltip>}
                            >
                              <span>
                                {proposal.status.charAt(0) + proposal.status.slice(1).toLowerCase()}
                                {(proposal.status === "PENDING" ||
                                  proposal.status === "ACTIVE") && <span> ⏰</span>}
                              </span>
                            </OverlayTrigger>
                          </td>
                          <td>
                            <Button
                              variant="primary"
                              className="neon-highlight"
                              onClick={() => {
                                clickVote(proposal, forVotes, againstVotes, endTime);
                              }}
                            >
                              Vote
                            </Button>
                          </td>
                        </tr>
                      );
                      return row;
                    })}
                  </tbody>
                </Table>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
      <Delegate
        show={delegateShow}
        onHide={() => setDelegateShow(false)}
        refresh={() => refresh()}
      />
      <NewProposal
        show={newProposalShow}
        onHide={() => setNewProposalShow(false)}
        refresh={() => refresh()}
      />
      <Vote
        show={voteShow}
        onHide={() => {
          setVoteShow(false);
        }}
        proposal={voteProposal}
        forVote={voteFor}
        against={voteAgainst}
        endTime={voteEndTime}
      />
    </div>
  );
};
export default Governance;
