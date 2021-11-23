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
  Alert,
  Collapse,
  IconButton,
  Avatar,
  Card,
  CardMedia,
  CardActions,
  CardHeader,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconRefresh from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./global.css";
import randomWords from "random-words";
import Big from "big.js";
import axios from "axios";
import CanvasDraw from "react-canvas-draw";

import getConfig from "./config";
const { networkId } = getConfig("testnet");

export default function App() {
  const isLoggedIn = () => window.walletConnection.isSignedIn();

  return (
    <>
      <MyAppBar />
      {isLoggedIn() ? (
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            style={{ marginTop: 65, textAlign: "center", marginRight: 20 }}
            variant="h6"
          >
            Hi {window.accountId}! Draw your Own NFT!
          </Typography>
          <MintForm />
        </Box>
      ) : (
        <Typography
          style={{ marginTop: 65, textAlign: "center", marginRight: 20 }}
          variant="h6"
        >
          Sign in to draw and mint your unique NFT!
        </Typography>
      )}
    </>
  );
}

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const randomString = () => capitalize(randomWords(3).join(" "));

const MintForm = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [color, setColor] = useState("#000");
  const [previousNft, setPreviousNft] = useState(undefined);

  const [metadata, setMetadata] = useState({
    title: randomString(),
    description: "Your NFT description",
    copies: 1,
  });

  const regenerateTitle = () =>
    setMetadata((prev) => {
      return {
        ...prev,
        title: randomString(),
      };
    });

  const isFormValid = () => {
    return (
      metadata.title !== "" &&
      metadata.description !== "" &&
      metadata.copies > 0
    );
  };

  const randomTokenId = () => {
    const min = Math.ceil(1000);
    const max = Math.floor(10000);
    return `${Math.floor(Math.random() * (max - min) + min)}`;
  };

  const BOATLOAD_OF_GAS = Big(3)
    .times(10 ** 13)
    .toFixed();

  const nftStorageApiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDViNDlGMUNDRmY2MGVkMWEwNDJmZEU5ODIzNDNhQTRiZWRBOUIzOTkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNzYxNjczMTcyNiwibmFtZSI6Im5lYXJ2ZXJtYmVyIn0.p-isz43Ls6ljKY2A9csp0dg1IKR7nWJZ687ruOmRXAk";

  const mintNft = async () => {
    const ref = drawRef.current;
    const drawUrl = ref.getDataURL("image/jpeg", false, "#fff");
    const blob = await (await fetch(drawUrl)).blob();
    var reader = new FileReader();
    reader.onloadend = async function () {
      const response = await axios.post(
        `https://api.nft.storage/upload`,
        reader.result,
        {
          headers: { Authorization: `Bearer ${nftStorageApiKey}` },
        }
      );
      const mediaUrl = `https://${response.data.value.cid}.ipfs.dweb.link/`;
      contractCall(mediaUrl);
    };
    reader.readAsArrayBuffer(blob);
  };

  const drawRef = useRef(null);

  const cleanCanvas = () => {
    drawRef.current.clear();
  };

  const undo = () => {
    drawRef.current.undo();
  };

  const removePreviousNft = () => {
    localStorage.setItem("nft_token_id", null);
    setPreviousNft(null);
  };

  useEffect(() => {
    const existingtTokenId = localStorage.getItem("nft_token_id");
    getNftByTokenId(existingtTokenId);
  }, []);

  const getNftByTokenId = (existingtTokenId) => {
    if (existingtTokenId) {
      window.contract
        .nft_token({
          token_id: existingtTokenId,
        })
        .then(
          (data) => {
            setPreviousNft(data);
            setIsloading(false);
          },
          (err) => {
            removePreviousNft();
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

  const contractCall = (mediaUrl) => {
    const tokenId = randomTokenId();
    localStorage.setItem("nft_token_id", tokenId);
    window.contract
      .nft_mint(
        {
          token_id: tokenId,
          receiver_id: window.accountId,
          metadata: {
            title: metadata.title,
            description: metadata.description,
            copies: parseInt(metadata.copies),
            media: mediaUrl,
          },
        },
        BOATLOAD_OF_GAS,
        Big(0.01)
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
  };

  if (previousNft) {
    return (
      <Box autoComplete="off">
        <Grid style={{ marginTop: 10 }} container spacing={2}>
          <Grid
            item
            xs={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Card sx={{ maxWidth: 600 }}>
              <CardHeader
                title={previousNft.metadata.title}
                subheader={previousNft.metadata.description}
              />
              <CardMedia
                component="img"
                height="600"
                image={previousNft.metadata.media}
                alt={previousNft.metadata.title}
              />
              <CardActions disableSpacing>
                <Button onClick={removePreviousNft}>Draw another one</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <>
      <Box autoComplete="off">
        <Grid style={{ marginTop: 10 }} container spacing={2}>
          <Grid item xs={7}>
            <TextField
              fullWidth
              id="title"
              value={metadata.title}
              onChange={(event) =>
                setMetadata((prev) => {
                  return {
                    ...prev,
                    title: event.target.value,
                  };
                })
              }
              label="Title"
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={regenerateTitle}
            >
              <IconRefresh />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              id="copies"
              label="Copies"
              variant="outlined"
              value={metadata.copies}
              onChange={(event) =>
                setMetadata((prev) => {
                  return {
                    ...prev,
                    copies: event.target.value,
                  };
                })
              }
              type="number"
              max="999"
              min="1"
            />
          </Grid>
          <Grid item xs={10}>
            <TextField
              fullWidth
              id="description"
              value={metadata.description}
              onChange={(event) =>
                setMetadata((prev) => {
                  return {
                    ...prev,
                    description: event.target.value,
                  };
                })
              }
              label="Description"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              style={{ height: "100%" }}
              type="submit"
              variant="outlined"
              disabled={!isFormValid()}
              onClick={mintNft}
            >
              Mint
            </Button>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid
            item
            xs={8}
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={cleanCanvas}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={undo}
            >
              <UndoIcon />
            </IconButton>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("black")}
              sx={{ bgcolor: "black" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("gray")}
              sx={{ bgcolor: "gray" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("red")}
              sx={{ bgcolor: "red" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("blue")}
              sx={{ bgcolor: "blue" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("green")}
              sx={{ bgcolor: "green" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("yellow")}
              sx={{ bgcolor: "yellow" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("purple")}
              sx={{ bgcolor: "purple" }}
            >
              {" "}
            </Avatar>
            <Avatar
              style={{ cursor: "pointer" }}
              onClick={() => setColor("lightgreen")}
              sx={{ bgcolor: "lightgreen" }}
            >
              {" "}
            </Avatar>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid
            item
            xs={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <CanvasDraw
              canvasWidth={600}
              canvasHeight={600}
              brushColor={color}
              ref={drawRef}
            />
          </Grid>
          <Grid item xs={12}>
            <Collapse in={error !== ""}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setError("");
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            </Collapse>
          </Grid>
        </Grid>
      </Box>
      {showNotification && <Notification />}
    </>
  );
};

const MyAppBar = () => {
  const isLoggedIn = () => window.walletConnection.isSignedIn();

  return (
    <AppBar>
      <Toolbar>
        <Typography component="div" sx={{ flexGrow: 1 }}>
          NFT Minting
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

// this component gets rendered by App after the form is submitted
const Notification = () => {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      Mintint done.
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
