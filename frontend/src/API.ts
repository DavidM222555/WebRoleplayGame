import { Game } from "./GameEngine/Game";
import { CognitoUserSession } from "amazon-cognito-identity-js";

class APIError extends Error {
  constructor(msg: string = "API Generic Error Message") {
    super(msg);
    this.name = "APIError";
  }
}

export interface DataPacket {
  address?: string;
  sender?: string;
  type: string;
  data: any;
}

export interface Lobby {
  connected: string[];
  ready?: string[];
  password?: string;
  playerMax: number;
  game: Game;
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

interface CallbackData {
  id: string;
  callback: (event: any) => void;
}

const EVENTS = [
  "NAME_CHANGE",
  "GLOBAL_MESSAGE", 
  "TEAM_MESSAGE",
  "NEWS_MESSAGE", 
  "NEWS_MESSAGE_UPDATE",
  "JOIN_LOBBY",
  "LOBBY_CHANGE",
  "START_GAME"
]

const LOBBY_STATES = [
  "DISCONNECTED", "LOBBY", "GAME"
]

export class WebsocketAPI {
  public address: string | null;
  public lobbyCode: string | undefined;
  public lobbyIsPublic: boolean | undefined;
  public lobby: Lobby | undefined;

  private websocket: WebSocket;
  private globalMessages: ChatMessage[];
  private teamMessages: TeamChatMessage[];
  private newsMessages: string[];
  private actionHistory: ActionPacket[];
  private voteHistory: VotePacket[];
  private events: Map<string, CallbackData[]>;
  private lobbyState: number;
  
  constructor(websocketURL: string) {
    this.websocket = new WebSocket(websocketURL);
    this.websocket.onmessage = (msg) => this.handleMessage(this.websocket, msg);
    this.websocket.onclose = () => this.refresh();
    this.websocket.onerror = (err) => console.log("WS Error: ", err);
    this.address = null;
    this.globalMessages = [];
    this.teamMessages = [];
    this.newsMessages = [];
    this.actionHistory = [];
    this.voteHistory = [];
    this.events = this.createEvents();
    this.lobbyState = 0;
  }

  public getLobbyState = () => {return this.lobbyState}
  public getLobbyStateString = () => {return LOBBY_STATES[this.lobbyState]}

  private setLobbyState = (state: number) => {
    if (state < 0 || state > LOBBY_STATES.length)
      return;

    this.lobbyState = state;
  }

  private handleMessage = (_websocket: WebSocket, message: MessageEvent) => {
    const packet: DataPacket = JSON.parse(message.data);
    console.log(packet.type);

    // Remove packets with no address - these are sent to server only
    if (!packet.address)
      return;

    // If getting an address, assign it and be done
    if (packet.type == "ADDRESS_ASSIGNMENT") {
      this.address = packet.data;
      this.runCallbacks("NAME_CHANGE", this.address);
      return;
    }

    // Ignore messages not addressed to client
    if (!this.address || this.address !== packet.address) return;
    
    switch (packet.type) {
      case "ADDRESS_ASSIGNMENT":
        this.address = packet.data;
        this.runCallbacks("NAME_CHANGE", this.address);
        console.log("Assigned to address ", this.address);
        break;

      case "SERVER_UPDATE":
        console.log("Server: ", packet.data);
        break;

      case "GLOBAL_MESSAGE":
        const chat: ChatMessage = packet.data as ChatMessage;
        if (!chat)
          return;

        this.globalMessages.push(chat);
        this.runCallbacks("GLOBAL_MESSAGE", chat);

        break;

      case "TEAM_MESSAGE":
        const teamMsg: TeamChatMessage = packet.data as TeamChatMessage;
        if (!teamMsg)
          return;

        this.teamMessages.push(teamMsg);
        this.runCallbacks("TEAM_MESSAGE", teamMsg);

        break;

      case "NEWS_MESSAGE":
        const newsMsg: ChatMessage = packet.data as ChatMessage;
        if (!newsMsg)
          return;

        this.newsMessages.push(newsMsg.message);
        this.runCallbacks("NEWS_MESSAGE", newsMsg.message);

        break;

      case "NEWS_MESSAGE_UPDATE":
        this.newsMessages = JSON.parse(packet.data);

        this.runCallbacks("NEWS_MESSAGE_UPDATE", this.newsMessages);

        break;
        
      case "JOIN_LOBBY":
        if (!packet.data.code || !packet.data.lobby) return;

        if (packet.data.code !== this.lobbyCode) {
          this.lobby = packet.data.lobby as Lobby;
          this.lobbyCode = packet.data.code;
          this.lobbyIsPublic = packet.data.isPublic as boolean;
          this.setLobbyState(1);
        }

        this.runCallbacks("JOIN_LOBBY", packet.data);

        break;

      case "LOBBY_UPDATE":
        if (!packet.data)
          return;

        this.lobby = packet.data.lobby as Lobby | undefined;
        this.lobbyCode = packet.data.code;
        this.lobbyIsPublic = packet.data.isPublic as boolean;
        this.setLobbyState(1);
        this.runCallbacks("LOBBY_CHANGE", this.lobby);

        break;

      case "PLAYER_JOIN":
        if (!packet.data || !this.lobby) return;

        this.lobby.connected.push(packet.data);
        this.runCallbacks("LOBBY_CHANGE", this.lobby);

        break;

      case "PLAYER_LEFT":
        if (!packet.data || !this.lobby) return;

        this.lobby.connected = this.lobby.connected.filter((name) => name !== packet.data);
        this.runCallbacks("LOBBY_CHANGE", this.lobby);

        break;

      case "GAME_START":
        console.log("GAME START")
        if (!this.lobby) return;

        this.setLobbyState(2);

        this.runCallbacks("START_GAME", this.lobby);

        break;

      case "LOBBY_READY_UPDATE":
        if (!packet.data || !this.lobby) return;

        this.lobby.ready = packet.data;
        this.runCallbacks("LOBBY_CHANGE", this.lobby);

        break;

        
    }
  }

  public isReady = (address_check: boolean = true) => {
    const open = this.websocket && this.websocket.readyState === 1;
    // If connection open, request new address
    if (open && !this.address && address_check)
      this.requestAddress();

    return open && (this.address || !address_check);
  }

  private requestAddress = () => {
    this.sendMessage("ADDRESS_REQUEST");
  }

  private createEvents = () => {
    let map: Map<string, CallbackData[]> = new Map();
    for (const event of EVENTS) {
      map.set(event, []);
    };
    return map;
  }

  // Register an event callback. Returns the id string used for unregistering
  public register = (event: string, callback: (event: any) => void) => {
    // If event isn't registered, return
    let arr = this.events.get(event);
    if (!arr)
      throw new APIError(`Invalid event specified: ${event}`);

    // Create the "id" and push
    const hexID = (new Date()).getTime().toString(16);
    arr.push({ id: hexID, callback: callback });
    this.events.set(event, arr);

    // Return "id" for deconstruction
    return hexID;
  }

  // Unregister a callback
  public unregister = (event: string, id: string) => {
    let arr = this.events.get(event);
    if (!arr)
      throw new APIError(`Invalid event specified: ${event}`);

    arr = arr.filter(data => data.id !== id);
    this.events.set(event, arr);

    return;
  }

  // Run the callbacks for a specified event, the equivalent of "firing" the event
  private runCallbacks = (event: string, data: any) => {
    const callbacks = this.events.get(event) || [];
    let passed: CallbackData[] = [];
    callbacks.forEach((entry) => {
      try {
        entry.callback(data);
        passed.push(entry);
      } catch (err) { // Catch errors and remove callbacks that cause them
        console.log(`Removed callback '${event}-${entry.id}' because of error printed below.`);
        console.log(err);
      }
    });
    // Update with only non-errored callbacks
    this.events.set(event, passed);
  }

  // Refreshes websocket connection, not often used if at all
  public refresh = () => {
    if (this.websocket.readyState !== 3)
      return;

    this.websocket = new WebSocket("ws://localhost:8000");
    this.websocket.onmessage = (msg) => this.handleMessage(this.websocket, msg);
    this.websocket.onclose = () => this.refresh();
  }

  // Server ping command, mostly just used for development
  public ping = () => {
    if (!this.isReady())
      throw new APIError("API connection isn't ready");
    
    this.websocket.send(JSON.stringify({
      address: "server",
      sender: (this.address ? this.address : null),
      type: "UPDATE",
      data: "You are being pinged."
    }));

    return this.websocket.readyState;
  }

  private sendMessage = (type: string, data: any = "", address: string = "server"): void => {
    if (!this.isReady())
      throw new APIError("API connection isn't ready");

    if (!this.address)
      throw new APIError("No given address to communicate with server");

    this.websocket.send(JSON.stringify({
      address: address,
      sender: (this.address ? this.address : null),
      type: type,
      data: data
    }));
    return;
  }

  public REQUEST_NAME = (name: string) => {
    if (!this.lobby)
      this.sendMessage("CHOSEN_ADDRESS_REQUEST", name);
    else
      throw new APIError("Can't change name while in a lobby");
  }

  public REQUEST_LOBBY_OBJ = () => { this.sendMessage("REFRESH_LOBBY_OBJECT"); }

  public SEND_GLOBAL_MESSAGE = (message: string) => {
    const toSend: ChatMessage = {
      author: (this.address ? this.address : "Anonymous"),
      message: message
    };

    this.sendMessage("GLOBAL_MESSAGE", toSend);
    this.globalMessages.push(toSend);

    return;
  }

  public GET_GLOBAL_MESSAGES = () => { return this.globalMessages; }

  public SEND_PUBLIC_LOBBY_REQUEST = (code?: string) => this.sendMessage("JOIN_LOBBY_REQUEST", { code: code });

  public LEAVE_LOBBY = () => {
    this.sendMessage("LEAVE_LOBBY");
    this.lobby = undefined;
    this.lobbyCode = undefined;
    this.lobbyState = 0;
  }

  public SEND_READY_UP_REQUEST = () => {
    this.sendMessage("READY_UP", {
      code: this.lobbyCode,
      isPublic: this.lobbyIsPublic
    });
  }

  public GET_TEAM_MESSAGES = () => { return this.teamMessages; }

  public SEND_TEAM_MESSAGE = (message: string, team: string) => {
    if (!this.isReady())
      throw new APIError("API connection isn't ready");

    const toSend: TeamChatMessage = {
      author: (this.address ? this.address : "Anonymous"),
      message: message,
      team: team
    };

    this.sendMessage("TEAM_MESSAGE", toSend)
    this.teamMessages.push(toSend);

    return;
  }

  public GET_NEWS_MESSAGES = () => { return this.newsMessages; }
  public FETCH_NEWS_MESSAGES = () => { this.sendMessage("NEWS_MESSAGE_UPDATE_REQUEST"); }

  public SEND_ACTION = (action: string, target: string) => {
    const toSend: ActionPacket = {
      sender: (this.address ? this.address : "Anonymous"),
      action: action,
      target: target,
    };

    this.sendMessage("ACTION_PACKET", toSend)
    this.actionHistory.push(toSend);

    return;
  }

  public SEND_VOTE = (target: string) => {
    const toSend: VotePacket = {
      sender: (this.address ? this.address : "Anonymous"),
      target: target,
    }

    this.sendMessage("VOTE_PACKET", toSend)
    this.voteHistory.push(toSend);

    return;
  }

  // this function is called whenever a user logs in successfully to amazon's services
  // currently it's purpose is to make sure that the backend has a list of all users
  // this should probably be done by a lambda but those are much harder to use
  public logIn = async (session: CognitoUserSession, callback: ()=> void) =>{
    console.log('in login in API file');
    this.sendMessage('LOGIN', session.getAccessToken().payload.username);
    callback();
  }
}

export default WebsocketAPI;