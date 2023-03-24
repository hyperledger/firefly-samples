// Copyright © 2021 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  Button,
  FormControl,
  Grid,
  makeStyles,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@material-ui/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FireFly, FireFlyMessageEvent } from './firefly';
import ReconnectingWebsocket from 'reconnecting-websocket';
import logo from './ff.png';

const HOST = 'http://localhost:5000';

function App(): JSX.Element {
  const classes = useStyles();
  const [balance, setBalance] = useState<string>('0');
  const [messageText, setMessageText] = useState<string>('');
  const firefly = useRef<FireFly | null>(null);
  const ws = useRef<ReconnectingWebsocket | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const refreshBalance = async () => {
    if (firefly.current) {
      const currentBalance = await firefly.current.getBalances();
      if (currentBalance.length > 0 && currentBalance[0].balance) {
        setBalance('' + Math.round(parseInt(currentBalance[0].balance) / 1e18));
      }
    }
  };

  const load = useCallback(async () => {
    firefly.current = new FireFly(HOST);
    refreshBalance();

    const wsHost = HOST.replace('http', 'ws');
    if (ws.current !== null) {
      ws.current.close();
    }
    ws.current = new ReconnectingWebsocket(
      `${wsHost}/ws?namespace=default&ephemeral&autoack`
    );
    ws.current.onopen = () => {
      console.log('Websocket connected');
    };
    ws.current.onmessage = (message) => {
      const data: FireFlyMessageEvent = JSON.parse(message.data);
      console.log(data);
      if (data.type === 'token_transfer_confirmed') {
        refreshBalance();
      }
    };
    ws.current.onerror = (err) => {
      console.error(err);
    };
  }, []);

  interface BalanceOptions {
    currentBalance: string;
  }

  const Balance = (options: BalanceOptions) => {
    const classes = useStyles();

    const rows = [];
    rows.push(
      <TableRow>
        <TableCell className={classes.scrollRight}>
          <h3>{options.currentBalance}</h3>
        </TableCell>
      </TableRow>
    );

    return (
      <Table>
        <TableBody>{rows}</TableBody>
      </Table>
    );
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={1} md={2} xl={3} />
        <Grid item xs={10} md={8} xl={6}>
          <Paper
            className={classes.paper}
            component="form"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await firefly.current?.sendTokenMint({
                  amount: `${parseInt(messageText) * 1000000000000000000}`,
                  pool: 'MINTSAMPLE',
                  tokenIndex: '',
                });
                setConfirmationMessage('' + messageText + ' tokens minted');
              } catch (err) {
                setConfirmationMessage(`Error: ${err}`);
              }
              refreshBalance();
            }}
          >
            <h1>
              <img height="30px" src={logo} alt="FireFly"></img> Mint New
              Fungible Tokens
            </h1>

            <FormControl className={classes.formControl} fullWidth={true}>
              <TextField
                label="Number of tokens to mint"
                variant="outlined"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
              />
            </FormControl>

            <FormControl className={classes.formControlRight}>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </FormControl>

            <div className={classes.clearFix} />
          </Paper>

          <br />

          <Paper className={classes.paper}>
            <h1>Current Token Balance</h1>

            <Balance currentBalance={balance} />
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={!!confirmationMessage}
        autoHideDuration={3000}
        message={confirmationMessage}
        onClose={() => setConfirmationMessage('')}
      />
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(2),
  },
  formControlRight: {
    marginTop: theme.spacing(2),
    float: 'right',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  upload: {
    display: 'none',
  },
  clearFix: {
    clear: 'both',
  },
  scrollRight: {
    overflowX: 'scroll',
    [theme.breakpoints.up('xs')]: {
      maxWidth: 150,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 350,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 450,
    },
  },
}));

export default App;
