import React, { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { AptosClient, AptosAccount, FaucetClient } from "@aptos-labs/aptos";
import { Routes, Route } from "react-router-dom";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";

import { ABI } from "./data/Data";

import Create from "./pages/Create";
import Voting from "./pages/Voting";
import Result from "./pages/Result";
import Home from "./pages/Home";
import Appbar from "./components/Appbar";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

const NODE_URL = "https://fullnode.testnet.aptoslabs.com"; // Aptos testnet fullnode URL
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com"; // Aptos testnet faucet URL

const App = () => {
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState(null);
    const [client, setClient] = useState(null);
    const [choices, setChoices] = useState([]);
    const [disable, setDisable] = useState(false);
    const [totalVoters, setTotalVoters] = useState(0);
    const [state, setState] = useState(-1);
    const [ballot, setBallot] = useState({
        name: "",
        proposal: "",
        address: "",
    });
    const [isAlreadyCreated, setIsAlreadyCreated] = useState(false);
    const [visible, setVisible] = useState(false);
    const [ended, setEnded] = useState(false);
    const [totalVote, setTotalVote] = useState(0);
    const [isVoter, setIsVoter] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    const loadBlockchainData = useCallback(async () => {
        setLoading(true);

        try {
            const aptosClient = new AptosClient(NODE_URL);
            setClient(aptosClient);

            const aptosAccount = new AptosAccount(); // Generates a new Aptos account
            setAccount(aptosAccount);

            // Optional: Fund account via faucet (for testing)
            const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
            await faucetClient.fundAccount(aptosAccount.address(), 100_000_000); // Fund with 100 APT

            toast.success("Aptos account connected successfully.");
        } catch (error) {
            toast.error("Failed to connect to Aptos network: " + error.message);
        }

        setLoading(false);
    }, []);

    const getChoices = useCallback(async () => {
        setLoading(true);
        // Replace with logic to fetch choices using Aptos client and your contract's ABI
        setChoices([]);
        setLoading(false);
    }, [client]);

    const startVoting = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Implement start voting logic using Aptos client and contract
            toast.success("Voting started successfully.");
            setDisable(true);
        } catch (error) {
            toast.error("Failed to start voting: " + error.message);
        }

        setLoading(false);
    };

    const getVoters = useCallback(async () => {
        setLoading(true);
        // Replace with logic to fetch total voters using Aptos client
        setTotalVoters(0);
        setLoading(false);
    }, [client]);

    const getCurrentState = useCallback(async () => {
        setLoading(true);
        // Replace with logic to fetch state using Aptos client
        setState(0);
        setEnded(false);
        setLoading(false);
    }, [client]);

    const getBallotDetails = useCallback(async (e) => {
        e?.preventDefault();
        setLoading(true);
        // Replace with logic to fetch ballot details using Aptos client
        setBallot({ proposal: "Proposal Example", name: "Ballot Name", address: "0x123" });
        setIsAlreadyCreated(true);
        setState(0);
        setLoading(false);
        setVisible(true);
    }, [client]);

    const checkIsVoter = useCallback(async () => {
        setLoading(true);
        // Replace with logic to check if the user is a voter using Aptos client
        setIsVoter(true);
        setHasVoted(false);
        setLoading(false);
    }, [client]);

    const endVoting = async () => {
        setLoading(true);

        try {
            // Implement end voting logic using Aptos client and contract
            toast.success("Voting ended successfully.");
            setEnded(true);
        } catch (error) {
            toast.error("Failed to end voting: " + error.message);
        }

        setLoading(false);
    };

    const getTotalVotes = useCallback(async () => {
        setLoading(true);
        // Replace with logic to fetch total votes using Aptos client
        setTotalVote(0);
        setLoading(false);
    }, [client]);

    useEffect(() => {
        loadBlockchainData();
    }, [loadBlockchainData]);

    return (
        <Box>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Appbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/ballot"
                    element={
                        <Create
                            client={client}
                            account={account}
                            setLoading={setLoading}
                            // Choices
                            getChoices={getChoices}
                            choices={choices}
                            // Voting
                            disable={disable}
                            setDisable={setDisable}
                            startVoting={startVoting}
                            // Voters
                            totalVoters={totalVoters}
                            getVoters={getVoters}
                            // Get State
                            state={state}
                            getCurrentState={getCurrentState}
                            // Get Ballot
                            ballot={ballot}
                            setBallot={setBallot}
                            getBallotDetails={getBallotDetails}
                            isAlreadyCreated={isAlreadyCreated}
                            setIsAlreadyCreated={setIsAlreadyCreated}
                        />
                    }
                />
                <Route
                    path="/voting"
                    element={
                        <Voting
                            account={account}
                            client={client}
                            setLoading={setLoading}
                            // Choices
                            getChoices={getChoices}
                            choices={choices}
                            // Get State
                            state={state}
                            ended={ended}
                            getCurrentState={getCurrentState}
                            // Get Ballot
                            ballot={ballot}
                            setBallot={setBallot}
                            visible={visible}
                            getBallotDetails={getBallotDetails}
                            // End Voting
                            endVoting={endVoting}
                            // Total Votes
                            totalVote={totalVote}
                            getTotalVotes={getTotalVotes}
                            getVoters={getVoters}
                            totalVoters={totalVoters}
                            // Check
                            checkIsVoter={checkIsVoter}
                            isVoter={isVoter}
                            hasVoted={hasVoted}
                        />
                    }
                />
                <Route
                    path="/result"
                    element={
                        <Result
                            setLoading={setLoading}
                            getBallotDetails={getBallotDetails}
                            state={state}
                            ballot={ballot}
                            // Voting
                            client={client}
                            // Choices
                            choices={choices}
                            getChoices={getChoices}
                            getCurrentState={getCurrentState}
                        />
                    }
                />
            </Routes>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default App;
