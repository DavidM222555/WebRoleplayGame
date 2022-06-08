const mysql = require("mysql");
const express = require("express");
//import { WebSocketServer } from 'ws';
const WebSocket = require("ws");
//setting up .env variables
import * as dotenv from 'dotenv';
dotenv.config();

import { BackendWebsocketAPI } from "./BackendWebsocketAPI";

// Make server
const API = new BackendWebsocketAPI;