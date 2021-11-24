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
  IconButton,
  Button,
  Card,
  CardMedia,
  CardHeader,
  CardContent,
  CssBaseline,
} from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { ThemeProvider, useTheme, createTheme } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./global.css";
import Big from "big.js";
import screamingMan from "./assets/screaming.png";
import screamingMan2 from "./assets/screaming2.png";

import getConfig from "./config";
const { networkId } = getConfig("testnet");

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  const isLoggedIn = () => window.walletConnection.isSignedIn();

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <MyAppBar />
        {isLoggedIn() ? (
          <Box sx={{ flexGrow: 1 }}>
            <TokenCard />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <Grid
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 50,
              }}
              container
              spacing={2}
            >
              <Card sx={{ maxWidth: 1200 }}>
                <CardHeader
                  style={{ textAlign: "center" }}
                  title={`Scream together with yout friend using AAAAA token`}
                  subheader={`Sign in to start!`}
                  action={
                    <IconButton
                      component="a"
                      href="https://youtu.be/gfkts0u-m6w?t=25"
                      target="_blank"
                      aria-label="settings"
                    >
                      <YouTubeIcon />
                    </IconButton>
                  }
                />
                <CardMedia
                  component="img"
                  image={screamingMan2}
                  alt="Screaming"
                />
              </Card>
            </Grid>
          </Box>
        )}
      </ThemeProvider>
    </>
  );
}

const TokenCard = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [receiver, setReceiver] = useState("lkskrnk.testnet");
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsloading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [receiverRegistered, setReceiverRegistered] = useState(false);
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [totalSupply, setTotalSupply] = useState(null);

  const BOATLOAD_OF_GAS = Big(3)
    .times(10 ** 13)
    .toFixed();

  const storedBalance = () =>
    localStorage.getItem(`balance_${window.accountId}`);

  const resetStoredBalance = () =>
    localStorage.removeItem(`balance_${window.accountId}`);

  const setStoredBalance = (newBalance) =>
    localStorage.setItem(`balance_${window.accountId}`, newBalance);

  const isRegistered = (account) => {
    return window.contract.is_registered({
      account_id: account,
    });
  };

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
              setMessage(`Mint Succesfull, new balance ${data} $AAAAA `);
            } else {
              setMessage(`Transfer Succesfull, new balance ${data} $AAAAA `);
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

  useEffect(() => {
    window.contract.ft_total_supply({}).then((data) => {
      setTotalSupply(data);
    });
  }, []);

  const registerToken = () => {
    window.contract.storage_deposit(
      {
        account_id: window.accountId,
      },
      BOATLOAD_OF_GAS,
      Big(0.01)
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
      Big(0.01)
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
      Big(0.01)
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
          <Card sx={{ maxWidth: 800 }}>
            <CardHeader
              title={`Hi, ${window.accountId}!`}
              subheader={`Send $AAAAA to you friend to scream together! Your balance is ${balance} $AAAAA`}
              action={
                <IconButton
                  component="a"
                  href="https://youtu.be/gfkts0u-m6w?t=25"
                  target="_blank"
                  aria-label="settings"
                >
                  <YouTubeIcon />
                </IconButton>
              }
            />
            <CardMedia
              component="img"
              image={screamingMan}
              alt="Screaming Man"
            />
            <CardContent>
              <Grid style={{ marginTop: 10 }} container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Register your account first and then Mint 1000 $AAAAA.{" "}
                    {totalSupply && `Total Issuance: ${totalSupply} $AAAAA`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    style={{ height: "100%" }}
                    onClick={registerToken}
                    disabled={registered}
                    variant="outlined"
                  >
                    {registered ? "Account Registered" : "Register"}
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
                    onChange={async (event) => {
                      const res = event.target.value;
                      setReceiver(res);
                      // const isReg = await isRegistered(res);
                      // setReceiverRegistered(isReg);
                    }}
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
                    disabled={receiver === ""}
                    variant="outlined"
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
  const [mode, setMode] = useState("light");
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );
  return (
    <>
      {isLoggedIn() ? (
        <Button style={{ float: "right" }} onClick={logout} color="inherit">
          Log out
        </Button>
      ) : (
        <Button style={{ float: "right" }} color="inherit" onClick={login}>
          Login
        </Button>
      )}
    </>
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
