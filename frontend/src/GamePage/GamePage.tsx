import * as React from 'react';
import ActionSection from './ActionSection';
import ChatSection from './ChatSection';
import "./GamePageStyles.css"
import PlayerSection from './PlayerSection';
import { 
  ActionsDaySectionDiv,
  ActionsSectionDiv, BackgroundDiv, ChatPageSection, ChatSectionDiv, Column,
  DayIndicatorDiv,
  DayIndicatorTag,
  GameActionsInfoSection, GameInfoPageSection, NotesSectionDiv, PlayersSectionDiv, Row, UserInfoSectionDiv, UserNotesSectionDiv
} from './GameStyledComponents';
import UserInfoSection from './UserInfoSection';
import NewsSection from './NewsSection';
import { Role } from '../GameEngine/Roles';
import WebsocketAPI from '../API';
import VoteDialog from './VoteDialog';
import { useEffect, useState } from 'react';
import ConfirmActionPopup from './ConfirmActionPopup';
import { Game } from '../GameEngine/Game';
import { Button } from '@mui/material';
import NotesDialog from './NotesDialog';


export const GamePage = (props: { API: WebsocketAPI }) => {
  const [targetPlayerMode, setTargetPlayerMode] = useState<boolean>(false);
  const [targetedPlayer, setTargetedPlayer] = useState<Role | null>(null);
  const [confirmActionPopup, setConfirmActionPopup] = useState<boolean>(false);
  const [voted, setVoted] = useState<boolean>(false);
  const [notesOpen, setNotesOpen] = useState<boolean>(false);

  const [gameObj, setGameObj] = useState<Game | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      props.API.REQUEST_LOBBY_OBJ();
      setGameObj(props.API.lobby?.game);
      console.log(props.API.lobby?.game);
      console.log("Voted: " + voted);
      if (props.API.lobby?.game.currentPhaseOfTheGame !== "Voting" && voted) {
        console.log("reset vote");
        setVoted(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [voted]);

  const getUserRole = () => {
    if (props.API.address && props.API.lobby) 
      for (const role of props.API.lobby.game.roleManager.currentlyAssignedRoles)
        if (role.username === props.API.address)
          return role;
    return undefined;
  }

  return (
    <BackgroundDiv className="border" style={props.API.lobby && props.API.lobby.game ? props.API.lobby.game.currentPhaseOfTheGame === "Night" ? {backgroundImage: "url('/nighttime.jpg')"} : { backgroundImage: "url('/daytime.jpg')" } : { backgroundImage: "url('/daytime.jpg')" }}>
      <VoteDialog
        voting={props.API.lobby ? props.API.lobby.game.currentPhaseOfTheGame === "Voting" : false}
        castVote={(player: Role) => {
          console.log("cast vote");
          setVoted(true);
          console.log("cast vote 2");
          if (player.username)
            props.API.SEND_VOTE(player.username)
        }}
        voted={voted}
        playerRoles={gameObj ? gameObj.roleManager.currentlyAssignedRoles : []}
      />
      <NotesDialog
        open={notesOpen}
        closeNotes={() => {setNotesOpen(false);}}
      />
      <ConfirmActionPopup
        showPopup={confirmActionPopup}
        playerRole={targetedPlayer}
        confirmAction={() => {
          setConfirmActionPopup(false);
          setTargetPlayerMode(false);

          if (targetedPlayer && targetedPlayer.username)
            props.API.SEND_ACTION("kill", targetedPlayer.username);

          setTargetedPlayer(null);
        }}
        cancelAction={() => {
          setConfirmActionPopup(false);
          
          setTargetedPlayer(null);
        }}
      />
      <Row>
        {/* necessary to load images */}
        <img src={require("../Assets/Images/stolen_asset.jpg")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/daytime.jpg")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/nighttime.jpg")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/red_x.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/king.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/assassin.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Apothecary.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Chancellor.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Drunk.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Inquisitor.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Knight.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Magician.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Medic.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Poisoner.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Propagandist.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Streetrat.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/Vigilante.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/assassin.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/anonymous.png")} style={{display: "none"}}></img>
        <img src={require("../Assets/Images/anonymous_dead.png")} style={{display: "none"}}></img>
        <ChatPageSection>
          <Column>
            <ChatSectionDiv>
              <NewsSection
                API={props.API}
                title="Herald's News"
              />
            </ChatSectionDiv>
            <ChatSectionDiv>
              <ChatSection
                API={props.API}
                title="Noble Roundtable"
                type="team_chat"
                playerTeam={getUserRole() ? getUserRole()?.playerClass : ""}
              />
            </ChatSectionDiv>
            <ChatSectionDiv>
              <ChatSection
                API={props.API}
                title="Public Guildhall"
                type="public_chat"
              />
            </ChatSectionDiv>
          </Column>
        </ChatPageSection>
        <GameInfoPageSection>
          <Column>
            <GameActionsInfoSection>
              <Row>
                <ActionsDaySectionDiv>
                  <Column>
                    <DayIndicatorDiv className="border">
                      <DayIndicatorTag>
                        Day {gameObj ? gameObj.daysPassed + 1 : null} {gameObj ? " - " + gameObj.currentPhaseOfTheGame : ""}
                      </DayIndicatorTag>
                    </DayIndicatorDiv>
                    <ActionsSectionDiv className="border">
                      <ActionSection
                        // actions={[
                        //   {
                        //     name: targetPlayerMode ? "Cancel Action" : "Kill Player" ,
                        //     bgColor: targetPlayerMode ? "indianred" : "salmon",
                        //     action: () => { setTargetPlayerMode(!targetPlayerMode); },
                        //   }
                        // ]}
                        actions={[
                          {
                            name: getUserRole() && getUserRole()?.action ? getUserRole()?.action! : "action",
                            bgColor: targetPlayerMode ? "indianred" : "salmon",
                            action: () => { setTargetPlayerMode(!targetPlayerMode); },
                          }
                        ]}
                        passTurn={() => { console.log("pass turn"); }}
                      />
                    </ActionsSectionDiv>
                  </Column>
                </ActionsDaySectionDiv>
                <UserNotesSectionDiv>
                  <Column>
                    <UserInfoSectionDiv className="border">
                      <UserInfoSection
                        user={getUserRole()}
                      />
                    </UserInfoSectionDiv>
                    <NotesSectionDiv>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{
                          width: "100%",
                          height: "100%"
                        }}
                        onClick={() => {setNotesOpen(true);}}
                      >
                        Open Notes
                      </Button>
                    </NotesSectionDiv>
                  </Column>
                </UserNotesSectionDiv>
              </Row>
            </GameActionsInfoSection>
            <PlayersSectionDiv className="border">
              <PlayerSection
                targetPlayerMode={targetPlayerMode}
                setTargetedPlayer={(player: Role) => {
                  setTargetedPlayer(player);
                  setConfirmActionPopup(true);
                }}
                playerRoles={gameObj ? gameObj.roleManager.currentlyAssignedRoles : []}
              />
            </PlayersSectionDiv>
          </Column>
        </GameInfoPageSection>
      </Row>
    </BackgroundDiv>
  )
}

export default GamePage;