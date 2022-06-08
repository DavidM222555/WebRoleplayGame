import { Connection, ResultSetHeader, RowDataPacket } from "mysql2";
import { APIError } from "./BackendWebsocketAPI";
import { Game } from "./GameEngine/Game";

export class LobbyError extends Error {
  constructor(msg: string = "Generic Lobby Error Message") {
    super(msg);
    this.name = "LobbyError";
  }
}

interface Lobby {
  connected: string[];
  password?: string;
  ready?: string[];
  playerMax: number;
  game: Game;
}

interface LobbyInfo {
  code: string;
  isPublic: boolean;
  lobby: Lobby;
}

export class LobbyManager {
  private publicLobbies: Map<string, Lobby>;
  private privateLobbies: Map<string, Lobby>;
  private publicSalt: number;
  private privateSalt: number;
  private connection: Connection;

  constructor(database: Connection) {
    this.publicLobbies = new Map();
    this.privateLobbies = new Map();
    this.publicSalt = 0;
    this.privateSalt = 0;
    this.connection = database;
  }

  /* ========== Private helpers ========== */
  // Generate the lobby codes for both private and public lobbies
  private generateLobbyCode = (publicLobby: boolean = true) => {
    let code = "";
    // Same implementation, but public uses the public salt instead
    if (publicLobby) {
      const hex = (this.publicSalt + 0xF).toString(16);
      // Generate the code by essentially translating 0-9 into g-z and leaving all else as is
      for (let i = 0; i < hex.length; i++) {
        const currentASCII = hex.charCodeAt(i);
        if (currentASCII < 58 && currentASCII > 47)
          code += String.fromCharCode(
            Math.floor(Math.random() * 2) + // 0-1
            ((currentASCII-48) * 2) + //0,2,4,6...18
            103 // The ASCII value for g
          );
        else
          code += hex[i];
      }

      this.publicSalt++;
    } else {
      const hex = (this.privateSalt + 0xFFF).toString(16);
      // Generate the code by essentially translating 0-9 into g-z and leaving all else as is
      for (let i = 0; i < hex.length; i++) {
        const currentASCII = hex.charCodeAt(i);
        if (currentASCII < 58 && currentASCII > 47)
          code += String.fromCharCode(
            Math.floor(Math.random() * 2) + // 0-1
            ((currentASCII-48) * 2) + //0,2,4,6...18
            103 // The ASCII value for g
          );
        else
          code += hex[i];
      }

      this.privateSalt++;
    }

    // Add a random "tag" to the code for more variation
    code += String.fromCharCode(
      Math.floor(Math.random() * 26) + 97,
      Math.floor(Math.random() * 26) + 97
    );

    while (code.length < 8)
      code += String.fromCharCode(Math.floor(Math.random() * 2) + 102);

    return code;
  }

  // A helper function that creates public lobbies, since users aren't able to control them
  private createPublicLobby = (): string => {
    const code = this.generateLobbyCode();
    const lobby = {
      connected: [],
      playerMax: 16,
      game: new Game()
    };
    this.publicLobbies.set(code, lobby);
    return code;
  }

  /* ========== Public Functions ========== */
  
  // Self-explanatory, calls startUpkeep() on the Game object for the lobby
  startGameForLobby = (lobbyCode: string, isPublic: boolean) => {
    const lobby = (isPublic ? this.publicLobbies : this.privateLobbies).get(lobbyCode);
    if (!lobby) return;
    
    lobby.game.startUpkeep();
  }

  /* ========== Host Management ========== */
  private getHostCode = (host: string, cb: (code: string | undefined, isPublic: boolean) => void): void => {
    this.connection.execute(
      "SELECT * FROM LobbyRegistry WHERE name=?",
      [host],
      (err, result: RowDataPacket[]) => {
        if (err) { console.log(err); throw new APIError("SQLERR: " + err.message); }
        if (result.length > 1) throw new APIError("User was connected to more than one lobby, manager compromised.");
        if (result.length == 0) cb(undefined, true);
        else cb(result[0].lobby, result[0].public);
        return;
      }
    );
  }

  // Runs cb with a host's lobby information
  getHostLobbyInformation = (host: string, cb: (info: LobbyInfo | undefined) => void): void => {
    this.getHostCode(host, (code, isPublic) => {
      if (!code) {
        cb(undefined);
        return;
      }

      const lobby = (isPublic ? this.getPublicLobby(code) : this.getPrivateLobby(code));
      if (!lobby)
        throw new APIError("Lobby has code but no associated lobby");

      cb({ code: code, lobby: lobby, isPublic: !isPublic });

    });
  }

  // If host is connected, runs connectedCB. Otherwise, runs disconnectedCB.
  hostConnected = (host: string, connectedCB: () => void, disconnectedCB: () => void) => {
    this.getHostCode(host, (code) => {
      if (!code)
        disconnectedCB();
      else
        connectedCB();
    });
    return;
  }

  removeHost = (host: string): void => {
    this.connection.execute(
      "DELETE FROM LobbyRegistry WHERE name=?",
      [host],
      (err, result: ResultSetHeader) => {
        if (err) {
          console.log("RemoveHost Err: ", err);
        }
        if (result.affectedRows > 0) {
          this.publicLobbies.forEach((lobby) => {
            lobby.connected = lobby.connected.filter(connectedHost => connectedHost !== host);
            if (lobby.ready)
              lobby.ready = lobby.ready.filter(connectedHost => connectedHost !== host);
          });
          this.privateLobbies.forEach((lobby) => {
            lobby.connected = lobby.connected.filter(connectedHost => connectedHost !== host);
            if (lobby.ready)
              lobby.ready = lobby.ready.filter(connectedHost => connectedHost !== host);
          });
        }
      }
    );

    return;
  }

  /* ========== Lobby Management ========== */

  // Try to join a public lobby. If a code is given, join the specific lobby with that code
  joinPublicLobby = (host: string, cb: (code: string) => void, code?: string): void => {
    this.hostConnected(
      host, 
      () => { throw new LobbyError(`Host [${host}] tried to join a lobby while already connected`); },
      () => {
        // Determine what lobby will be "assigned" to the user
        let assigned: string | undefined = undefined;
        if (code) {
          if (!this.publicLobbies.has(code))
            throw new LobbyError("Incorrect room code given");
          else
            assigned = code;
        } else {
          // Find open lobby
          this.publicLobbies.forEach((lobby, lobbyCode) => {
            if (!assigned && !lobby.game.playing && lobby.connected.length < lobby.playerMax)
              assigned = lobbyCode;
          });

          if (!assigned) // Make a new lobby if no open lobbies found
            assigned = this.createPublicLobby();
        }

        // Actually join the user to lobby
        const lobby = this.publicLobbies.get(assigned);
        lobby?.connected.push(host);
        this.connection.execute(
          "INSERT INTO LobbyRegistry (name, lobby, public)\
           VALUES (?, ?, ?);\
          ",
          [host, assigned, true]
        );

        cb(assigned);
      }
    );
  }

  getPublicLobby = (code: string) => this.publicLobbies.get(code);

  getPrivateLobby = (code: string) => this.privateLobbies.get(code);

  /* ========== Readying System ========== */

  // Add a host to the list (array) of ready hosts
  //   returns the lobby object if the host was readied up
  //   returns undefined otherwise
  readyUp = (host: string, code: string, isPublic: boolean): LobbyInfo | undefined => {
    if (isPublic) { // Public implementation
      const lobby = this.publicLobbies.get(code);
      // Checks
      if (!lobby)
        throw new APIError(`No lobby for code ${code}`);
      if (lobby.game.playing) // Ignore ready up requests from in-game clients
        return undefined;
      if (!lobby.connected.includes(host))
        throw new APIError(`Ready up for host who isn't in lobby`);

      // Ready up
      if (!lobby.ready) // If nobody else has readied up, just set array
        lobby.ready = [host];
      else {
        if (host in lobby.ready) {
          console.log("WARN: Host tried to ready up when already ready");
          return undefined;
        }
        lobby.ready.push(host);
      }
      this.publicLobbies.set(code, lobby);
      return { code: code, lobby: lobby, isPublic: isPublic };
    } else { // The same as above, but for private lobbies. Probably faster to just branch instead of using ternary op
      const lobby = this.privateLobbies.get(code);
      if (!lobby)
        throw new APIError(`No lobby for code ${code}`);
      if (lobby.game.playing) // Ignore ready up requests from in-game clients
        return undefined;
      if (!(host in lobby.connected))
        throw new APIError(`Ready up for host who isn't in lobby`);

      if (!lobby.ready) // If nobody else has readied up, just set array
        lobby.ready = [host];
      else {
        if (host in lobby.ready) {
          console.log("WARN: Host tried to ready up when already ready");
          return undefined;
        }
        lobby.ready.push(host);
      }
      this.privateLobbies.set(code, lobby);
      return { code: code, lobby: lobby, isPublic: isPublic };
    }
  }
}