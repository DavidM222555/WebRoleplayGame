
import { Connection, createConnection, QueryError } from "mysql2";
import { Action, addVote, Vote } from "./GameEngine/Game";
import { LobbyManager } from "./Lobbying";

const Websocket = require("ws");

export class APIError extends Error {
  constructor(msg: string = "API Generic Error Message") {
    super(msg);
    this.name = "APIError";
  }
}

export interface User {
  username: string;
  host: string;
}

export interface DataPacket {
  address?: string;
  sender?: string;
  type: string;
  data: any;
}

export interface ChatMessage {
  author: string;
  message: string;
}

export interface TeamChatMessage extends ChatMessage {
  team: string;
}

export interface ActionPacket {
  sender: string;
  action: string;
  target: string;
}

export interface VotePacket {
  sender: string;
  target: string;
}

function generateRandomHexStr(len: number) {
  const hex = "012346789ABCDEF";
  let out = "";
  for (let i = 0; i < len; i++)
    out += hex.charAt(Math.floor(Math.random() * 15));
  return out;
}

function generateAddress() {
  return "GUEST" + Date.now().toString(16).toUpperCase();
}

// Similar to front-end API, but functions performed interact with the database
//  and return data when needed.
export class BackendWebsocketAPI {
  private server: any;
  private websockets: Map<string, WebSocket>;
  private timer: any;
  private manager: LobbyManager;
  private database: Connection;

  constructor() {
    this.websockets = new Map();

    this.server = new Websocket.Server({
      port: process.env.PORT ? process.env.port : 8000,
    });
    this.server.on("connection", (websocket: WebSocket) => {
      // Assign new socket address
      const newAddress = generateAddress();
      console.log(`Websocket [${newAddress}] connected`);
      websocket.send(
        JSON.stringify({
          address: newAddress,
          sender: "server",
          type: "ADDRESS_ASSIGNMENT",
          data: newAddress,
        })
      );
      this.websockets.set(newAddress, websocket);
      // Set up socket handling
      websocket.onmessage = (msg: MessageEvent) => {
        this.handleMessage(websocket, msg);
      };
      websocket.close = (code, _reason) => {
        let oldAddress = null;
        this.websockets.forEach((resident, address) => {
          if (resident == websocket) oldAddress = address;
        });
        if (oldAddress) {
          // Cleanup
          this.websockets.delete(oldAddress);
          this.manager.removeHost(oldAddress);
          console.log(`Websocket [${oldAddress}] disconnected (${code})`);
        }
      };
    });

    this.timer = setInterval(this.tick, 10000);

    if (!process.env.ENVIRONMENT) process.env.ENVIRONMENT = "local";

    if (process.env.ENVIRONMENT == "local") {
      // Local
      this.database = createConnection({
        host: "db",
        user: "root",
        password: process.env.DB_PASS,
        database: "revolution",
      });
      this.database.connect((err) => {
        if (err) {
          console.log(err);
          throw new APIError("Database connection couldn't be established");
        }

        console.log("Database connection established.");
      });
      this.initDatabase();

      this.manager = new LobbyManager(this.database);
    } else {
      // "Prod"
      throw new APIError(
        "Production environment specified when no production configuration has been created."
      );
    }
  }

  // All table creation SQL should go here.
  private initDatabase() {
    this.database.query(
      "CREATE TABLE IF NOT EXISTS LobbyRegistry(\
        name VARCHAR(200) NOT NULL,\
        lobby VARCHAR(20) NOT NULL,\
        public BOOLEAN,\
        PRIMARY KEY (name)\
      )"
    );
    this.database.query(
      `CREATE TABLE IF NOT EXISTS Users( \
       uuid VARCHAR(200) NOT NULL, \
       nickname VARCHAR(100),\
       gamesWon BIGINT NOT NULL DEFAULT 0, \
       PRIMARY KEY (uuid) 
      )`
    );
  }

  private tick() {
    // A clock, which can be set to not be used

    // If no connections, do nothing
    if (!this.websockets) return;

    // Consts
    const connectionUpdate: DataPacket = {
      address: "ALL",
      sender: "server",
      type: "SERVER_UPDATE",
      data: `There are currently ${this.websockets.size} other connections.`,
    };

    // Any websocket updates
    this.websockets.forEach((websocket) => {
      websocket.send(JSON.stringify(connectionUpdate));
    });
  }

  // Send a message to a known websocket address. Ensures common values between
  //   messages, such as specifying "server" as sender (all it does for now)
  private sendMessage(address: string, type: string, data: any = "") {
    const resident = this.websockets.get(address);
    if (!resident)
      throw new APIError("Can't send messages to unregistered websockets");

    resident.send(
      JSON.stringify({
        address: address,
        type: type,
        sender: "server",
        data: data,
      })
    );
    return;
  }

  // Send a message to a websocket who is already known, similar to sendMessage()
  private sendWebsocketMessage(
    websocket: WebSocket,
    address: string,
    type: string,
    data: any = ""
  ) {
    websocket.send(
      JSON.stringify({
        address: address,
        type: type,
        sender: "server",
        data: data,
      })
    );
    return;
  }

  private handleMessage(websocket: WebSocket, message: MessageEvent) {
    const packet: DataPacket = JSON.parse(message.data);
    // console.log(packet);

    // Early packet type checks that have to preempt the security checks
    switch (packet.type) {
      case "ADDRESS_REQUEST":
        if (packet.sender) break; // Return if sender is known

        let isNew = true;
        this.websockets.forEach((resident, rAddress) => {
          if (websocket === resident) {
            this.sendWebsocketMessage(
              websocket,
              rAddress,
              "ADDRESS_ASSIGNMENT",
              rAddress
            );
            isNew = false;
          }
        });

        if (isNew) {
          // Assign new socket address
          const newAddress = generateAddress();
          console.log(`Websocket [${newAddress}] has connected`);
          this.websockets.set(newAddress, websocket);
          this.sendWebsocketMessage(
            websocket,
            newAddress,
            "ADDRESS_ASSIGNMENT",
            newAddress
          );
          // Set up socket handling
          websocket.onmessage = (msg: MessageEvent) => {
            this.handleMessage(websocket, msg);
          };
        }

        return;

      case "CHOSEN_ADDRESS_REQUEST":
        // Ignore requests that don't specify an address
        if (!packet.data || typeof packet.data !== "string") return;

        packet.data.trim();

        if (packet.data.includes("server"))
          websocket.close(666, "Malicious intent assumed");

        const resident = this.websockets.get(packet.data);
        if (resident)
          if (resident === websocket) return;
          // They have the wanted address
          else packet.data += generateRandomHexStr(2);

        // Remove old address
        if (packet.sender && this.websockets.has(packet.sender))
          this.websockets.delete(packet.sender);

        // Assign new address
        console.log(
          `Websocket ${
            packet.sender ? `[${packet.sender}]` : "(New)"
          } is now [${packet.data}]`
        );
        this.websockets.set(packet.data, websocket);
        this.sendWebsocketMessage(
          websocket,
          packet.data,
          "ADDRESS_ASSIGNMENT",
          packet.data
        );

        return;
    }

    if (!packet.sender) return; // Ignore unaddressed packets

    const resident = this.websockets.get(packet.sender);
    if (!resident || resident !== websocket) return; // Ignore unregistered and wrongly addressed packets

    // Route traffic
    if (packet.address && packet.address !== "server") {
      const recipient = this.websockets.get(packet.address);
      if (recipient) recipient.send(message.data);
    }

    // Server operations
    switch (packet.type) {
      case "UPDATE":
        console.log(`Websocket [${packet.sender}]: ${packet.data}`);

        break;

      case "GLOBAL_MESSAGE":
        const chat = packet.data as ChatMessage;
        // If invalid or missing JSON data
        if (!chat) return;

        let packetToSend: DataPacket = {
          sender: packet.sender ? packet.sender : "Anonymous",
          type: "GLOBAL_MESSAGE",
          data: packet.data,
        };

        this.websockets.forEach((resident, address) => {
          if (packet.sender && packet.sender !== address) {
            packetToSend.address = address;
            resident.send(JSON.stringify(packetToSend));
          }
        });
        break;

      /* Unused case for now - kept in case Sami needs it for news messages
      case "GLOBAL_MESSAGE_UPDATE_REQUEST":
        // If no address to send data to, return
        if (!packet.sender || !this.websockets.has(packet.sender))
          return;

        this.sendMessage(packet.sender, "GLOBAL_MESSAGE_UPDATE", this.messages);

        break;
      */

      case "TEAM_MESSAGE":
        const teamChat = packet.data as TeamChatMessage;
        // If invalid or missing JSON data
        if (!teamChat) return;

        let teamChatPacketToSend: DataPacket = {
          sender: packet.sender ? packet.sender : "Anonymous",
          type: "TEAM_MESSAGE",
          data: packet.data,
        };

        this.websockets.forEach((resident, address) => {
          if (packet.sender && packet.sender !== address) {
            teamChatPacketToSend.address = address;
            resident.send(JSON.stringify(teamChatPacketToSend));
          }
        });
        break;

      case "JOIN_LOBBY_REQUEST":
        this.manager.joinPublicLobby(
          packet.sender,
          (lobbyCode) => {
            const lobby = this.manager.getPublicLobby(lobbyCode);
            if (!lobby)
              throw new APIError("Lobby manager supplied invalid lobby code");

            for (const host of lobby?.connected)
              if (host !== packet.sender)
                this.sendMessage(host, "PLAYER_JOIN", packet.sender);
              else
                this.sendWebsocketMessage(websocket, host, "JOIN_LOBBY", {
                  code: lobbyCode,
                  lobby: lobby,
                  isPublic: true,
                });
          },
          packet.data.code
        );

        break;

      case "LEAVE_LOBBY":
        this.manager.getHostLobbyInformation(packet.sender, (info) => {
          if (!info || !packet.sender) return;

          this.manager.removeHost(packet.sender);

          for (const host of info.lobby.connected)
            if (host !== packet.sender)
              this.sendMessage(host, "PLAYER_LEFT", packet.sender);
        });

        break;

      case "REFRESH_LOBBY_OBJECT":
        this.manager.getHostLobbyInformation(packet.sender, (info) => {
          if (!packet.sender) return;

          if (!info)
            this.sendWebsocketMessage(
              websocket,
              packet.sender,
              "LOBBY_UPDATE",
              undefined
            );
          else
            this.sendWebsocketMessage(
              websocket,
              packet.sender,
              "LOBBY_UPDATE",
              info
            );
        });

        break;

      case "READY_UP":
        if (!packet.data || !packet.data.code || !packet.data.isPublic) return;

        let info = this.manager.readyUp(
          packet.sender,
          packet.data.code,
          packet.data.isPublic
        );
        if (!info) return;

        if (info.lobby.ready) {
          this.manager.startGameForLobby(info.code, info.isPublic);
          for (const host of info.lobby.connected) {
            info.lobby.game.roleManager.addRolePlayerEntry(host);
            this.sendMessage(host, "GAME_START");
          }
        } else {
          for (const host of info.lobby.connected) {
            this.sendMessage(host, "LOBBY_READY_UPDATE", info.lobby.ready);
          }
        }

        break;

      case "ACTION_PACKET":
        const action = packet.data as ActionPacket;
        if (!packet.sender) return;

        this.manager.getHostLobbyInformation(packet.sender, (info) => {
          if (!info || !info.lobby) return;

          // If invalid or missing JSON data
          if (!action)
            return;

          const newAction: Action = new Action();
          newAction.typeOfAction = action.action;
          newAction.sender = action.sender;
          newAction.receiver = action.target;

          info.lobby.game.addAction(newAction);
        })
  
        break;
      
      case "VOTE_PACKET":
        const vote = packet.data as VotePacket;
        if (!packet.sender) return;

        this.manager.getHostLobbyInformation(packet.sender, (info) => {
          if (!info || !info.lobby) return;

          if (!vote) return;

          const newVote: Vote = new Vote(vote.sender, vote.target);
          addVote(info.lobby.game.currentDay, newVote);
        });

      case "LOGIN":
        console.log(packet);
        
      this.database.query(`SELECT uuid FROM Users`, (err: QueryError, results: any[])=>{
        if (err){
          console.error(err)
        }
        else {
          //console.log(results);
          if ( results.filter(e => e.uuid === packet.data).length === 0){
            this.database.query(`INSERT INTO Users (uuid) \n VALUES('${packet.data}')`, (err: QueryError)=>{if (err) console.error(err)});
          }
        }
      })
    }
  }

  // sendNewsMessage(msg: string) {
  //   this.websockets.forEach((resident, address) => {
  //     // if (packet.sender && packet.sender !== address) {
  //     //   teamChatPacketToSend.address = address;
  //     //   resident.send(JSON.stringify(teamChatPacketToSend));
  //     // }
  //   });
  // }

  stopTimer() {
    if (this.timer === null) return;

    clearInterval(this.timer);

    this.timer = null;
  }

  startTimer(tickLen: number = 10000) {
    if (this.timer !== null) return;

    setInterval(this.tick, tickLen);

    this.timer = null;
  }
}

export default BackendWebsocketAPI;
