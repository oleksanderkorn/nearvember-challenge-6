import "regenerator-runtime/runtime";
import React, { useEffect, useRef, useState } from "react";
import { login, logout } from "./utils";
import {
  Typography,
  Box,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardMedia,
  CardHeader,
  CardContent,
} from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./global.css";
import Big from "big.js";
import grumpyCat from "./grumpy_cat.jpeg";

import getConfig from "./config";
const { networkId } = getConfig("testnet");

export default function App() {
  const isLoggedIn = () => window.walletConnection.isSignedIn();

  return (
    <>
      <MyAppBar />
      {isLoggedIn() ? (
        <Box sx={{ flexGrow: 1 }}>
          <TokenCard />
        </Box>
      ) : (
        <Typography
          style={{ marginTop: 65, textAlign: "center", marginRight: 20 }}
          variant="h6"
        >
          Sign in to send some GRUMPY tokens to your friend for free!
        </Typography>
      )}
    </>
  );
}

const TokenCard = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [receiver, setReceiver] = useState("lkskrnk.testnet");
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsloading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const BOATLOAD_OF_GAS = Big(3)
    .times(10 ** 13)
    .toFixed();

  const storedBalance = () =>
    localStorage.getItem(`balance_${window.accountId}`);

  const resetStoredBalance = () =>
    localStorage.removeItem(`balance_${window.accountId}`);

  const setStoredBalance = (newBalance) =>
    localStorage.setItem(`balance_${window.accountId}`, newBalance);

  const getAccountBalance = () => {
    window.contract
      .ft_balance_of({
        account_id: window.accountId,
      })
      .then(
        (data) => {
          setBalance(data);
          setIsloading(false);
          const oldBalance = storedBalance();
          setStoredBalance(data);
          if (oldBalance && oldBalance !== data) {
            if (oldBalance < data) {
              setMessage(`Mint Succesfull, new balance ${data} $GRUMPY `);
            } else {
              setMessage(`Transfer Succesfull, new balance ${data} $GRUMPY `);
            }
            setShowNotification(true);
            setTimeout(() => {
              setShowNotification(false);
            }, 6000);
          }
        },
        (err) => {
          setError(
            err.kind && err.kind.ExecutionError
              ? err.kind.ExecutionError
              : `${err}`
          );
          setTimeout(() => {
            setError("");
          }, 5000);
          setIsloading(false);
        }
      );
  };

  useEffect(() => {
    getAccountBalance();
  }, []);

  const registerToken = () => {
    window.contract.storage_deposit(
      {
        account_id: window.accountId,
      },
      BOATLOAD_OF_GAS,
      Big(1)
        .times(10 ** 24)
        .toFixed()
    );
  };

  const registerReceiver = () => {
    window.contract.storage_deposit(
      {
        account_id: receiver,
      },
      BOATLOAD_OF_GAS,
      Big(1)
        .times(10 ** 24)
        .toFixed()
    );
  };

  const mintTokens = () => {
    window.contract.ft_mint(
      {
        receiver_id: window.accountId,
        amount: "1000",
      },
      BOATLOAD_OF_GAS,
      Big(1)
        .times(10 ** 24)
        .toFixed()
    );
  };

  const canTransfer = () => {
    return receiver !== "" && amount > 0 && amount < 1000;
  };

  const transferTokens = () => {
    if (canTransfer()) {
      window.contract
        .ft_transfer(
          {
            receiver_id: receiver,
            amount: `${amount}`,
          },
          BOATLOAD_OF_GAS,
          Big(0.000000000000000000000001)
            .times(10 ** 24)
            .toFixed()
        )
        .then(
          (res) => {
            setIsloading(false);
            setShowNotification(true);
            setTimeout(() => {
              setShowNotification(false);
            }, 5000);
          },
          (err) => {
            setError(
              err.kind && err.kind.ExecutionError
                ? err.kind.ExecutionError
                : `${err}`
            );
            setTimeout(() => {
              setError("");
            }, 5000);
            setIsloading(false);
          }
        );
    }
  };

  return (
    <Box autoComplete="off">
      <Grid style={{ marginTop: 40 }} container spacing={2}>
        <Grid
          item
          xs={12}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Card sx={{ maxWidth: 700 }}>
            <CardHeader
              title="Share GRUMPYness with your friend"
              subheader={`Your balance is  ${balance}$GRUMPY`}
            />
            <CardMedia
              component="img"
              height="500"
              width="500"
              image={grumpyCat}
              alt="Grumpy Cat"
            />
            <CardContent>
              <Grid style={{ marginTop: 10 }} container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Register yourself to use GRYMPY. Then Use Faucet to mint
                    1000 $GRYMPY.
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    style={{ height: "100%" }}
                    onClick={registerToken}
                    variant="outlined"
                  >
                    Register
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    style={{ height: "100%" }}
                    onClick={mintTokens}
                    variant="outlined"
                  >
                    Mint 1000
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Enter receiver address. You may also need to register
                    reciever. Use the dedicated button.
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    value={receiver}
                    onChange={(event) => setReceiver(event.target.value)}
                    label="Receiver"
                    variant="standard"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    style={{ height: "100%" }}
                    onClick={registerReceiver}
                    variant="outlined"
                    disabled={receiver === ""}
                  >
                    {`Register`}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Enter amount you want to send and click send!
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    type="number"
                    label="Amount"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    style={{ height: "100%" }}
                    onClick={transferTokens}
                    variant="outlined"
                    disabled={!canTransfer()}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {showNotification && (
        <Notification oldBalance={storedBalance()} message={message} />
      )}
    </Box>
  );
};

const MyAppBar = () => {
  const isLoggedIn = () => window.walletConnection.isSignedIn();

  return (
    <AppBar>
      <Toolbar>
        <Typography component="div" sx={{ flexGrow: 1 }}>
          {isLoggedIn()
            ? `Welcome to GRUMPY Cat Token Farm, ${window.accountId}`
            : "Welcome to GRUMPY Cat Token Farm"}
        </Typography>
        {isLoggedIn() ? (
          <Button onClick={logout} color="inherit">
            Log out
          </Button>
        ) : (
          <Button color="inherit" onClick={login}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

const Notification = ({ message }) => {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      ></a>
      {message}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  );
};
